const contextMatcher = require('http-proxy-middleware/lib/context-matcher');
const httpProxyMiddleware = require('http-proxy-middleware');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');
const chokidar = require('chokidar');
const chalk = require('chalk');
const logUpdate = require('log-update');
const Table = require('cli-table3');
const url = require('url');

module.exports = {
	/**
	 * 将请求URL和context配置的URL进行匹配
	 * @param context
	 * @param req
	 */
	contextMatch(context, req) {
		if (req.headers.referer) {
			const reqPath = req.originalUrl || req.url;
			return contextMatcher.match(context, reqPath, req);
		}
	},
	/**
	 * 运行proxy配置规则
	 * @param proxyRule 配置规则
	 * @param filename 配置文件
	 * @param opts 更多配置
	 */
	runProxyRule({ context, enable, target }, filename, opts = {}) {
		const proxyOptions = {
			context: context,
			target: target,
			changeOrigin: true,
			logLevel: 'warn',
			ws: true,
			onProxyRes: function onProxyReq(proxyRes, req, res) {
				proxyRes.headers['service-proxy-middleware-1-filename'] = filename;
				proxyRes.headers['service-proxy-middleware-2-context'] = JSON.stringify(context);
				proxyRes.headers['service-proxy-middleware-3-pathname'] = url.parse(req.url).pathname;
				proxyRes.headers['service-proxy-middleware-4-target'] = target;
				proxyRes.headers['service-proxy-middleware-5-match'] = path.join(target, req.url);
			},
			...opts,
		};
		return httpProxyMiddleware(context, proxyOptions);
	},
	/**
	 * 打印代理规则
	 */
	printProxyRule(mapProxyRules) {
		// 重新创建让表格自适应
		const table = new Table({
			// head: [chalk.bold('代理配置文件'), chalk.bold('enable (代理开关)'), chalk.bold('target (目标主机)'), chalk.bold('context (目标URL)')],
			head: [chalk.bold('代理配置文件'), chalk.bold('enable'), chalk.bold('target'), chalk.bold('context')],
			style: {border: []}
		});
		// 合并所有代理配置
		const mergeProxy =  Object.values(mapProxyRules).reduce((previous, current) => ({ ...previous, ...current}), {});
		Object.keys(mergeProxy).forEach(filename => {
			mergeProxy[filename].forEach(item => {
				table.push([chalk.yellowBright(filename), item.enable ? chalk.greenBright.bold(item.enable) : chalk.red.bold(item.enable), chalk.magentaBright(item.target), chalk.keyword('orange')(JSON.stringify(item.context))]);
			});
		});
		logUpdate('\n');
		logUpdate(table.toString() + '\n');
	},
	/**
	 * 获取入口
	 * @param webpackConfig webpack配置
	 */
	getEntryWithProxyMap({ webpackConfig, filename, publicPath, commonProxys }) {
		const mapHtml = webpackConfig.plugins.reduce((previous, plugin, index, array) => {
			if (plugin instanceof HtmlWebpackPlugin) {
				previous[path.join(publicPath, plugin.options.filename)] = new Set(commonProxys);
				previous[path.join(publicPath, plugin.options.filename)].plugin = plugin;
			}
			return previous;
		}, {});
		const addProxyRulesFile = (html, entry) => {
			const proxyRulesPath = path.join(path.parse(entry).dir, filename);
			// if (fs.existsSync(proxyRulesPath)) html.add(proxyRulesPath);
			html.add(proxyRulesPath);
		}
		Object.keys(mapHtml).forEach(key => {
			// 字符串类型 - entry
			if (typeof webpackConfig.entry === 'string') {
				addProxyRulesFile(mapHtml[key], webpackConfig.entry);
			}
			// 数组类型 - entry
			else if (Array.isArray(webpackConfig.entry)) {
				webpackConfig.entry.forEach(entry => addProxyRulesFile(mapHtml[key], entry));
			}
			// 对象类型 - entry
			else if (Object.prototype.toString.call(webpackConfig.entry) === '[object Object]') {
				Object.keys(webpackConfig.entry).filter(chunk => {
					if (mapHtml[key].plugin.options.excludeChunks.indexOf(chunk) !== -1) return false;
					if (mapHtml[key].plugin.options.chunks === 'all') return true;
					return mapHtml[key].plugin.options.chunks.indexOf(chunk) !== -1;
				}).forEach(chunk => {
					// 数组类型
					if (Array.isArray(webpackConfig.entry[chunk])) {
						webpackConfig.entry[chunk].forEach(entry => {
							addProxyRulesFile(mapHtml[key], entry);
						});
					}
					// 字符串类型
					else if (typeof webpackConfig.entry[chunk] === 'string') {
						addProxyRulesFile(mapHtml[key], webpackConfig.entry[chunk]);
					}
				});
			}
		});
		// Set转换为数组
		Object.keys(mapHtml).forEach(key => mapHtml[key] = [...mapHtml[key]]);
		return mapHtml;
	},
	/**
	 * 读取代理配置文件
	 */
	requireProxyFiles(mapProxyFiles) {
		const mapProxyRules = {};
		Object.keys(mapProxyFiles).forEach(key => {
			mapProxyRules[key] = mapProxyFiles[key].reduce((prev, curr) => {
				const module = this.noCacheRequire(curr);
				prev[curr] = Array.isArray(module) ? module : [];
				return prev;
			}, {});
		});
		return mapProxyRules;
	},
	/**
	 * 无缓存引入
	 */
	noCacheRequire(path) {
		try {
			const result = require(path);
			delete require.cache[path];
			return result;
		} catch (e) {
			return null;
		}
	},
	/**
	 * 监听代理配置文件
	 */
	watchProxyRuleFile(options) {
		const { server } = options;
		const arrProxyRules = [...new Set(Object.values(options.mapProxyFiles).reduce((prev, curr) => [...prev, ...curr], []))];
		const watcher = chokidar.watch(arrProxyRules, { persistent: true });
		watcher.on('all',  (event, path) => {
			if (['unlinkDir', 'addDir', 'ready', 'error', 'raw'].includes(event)) return;
			Object.keys(options.mapProxyFiles).forEach(key => {
				if (!options.mapProxyFiles[key].includes(path)) return;
				const module = this.noCacheRequire(path);
				options.mapProxyRules[key][path] = Array.isArray(module) ? module : [];
				// console.log(event, key, path, options.mapProxyRules[key][path]);
			});
			this.printProxyRule(options.mapProxyRules);
			// 刷新浏览器
			server && server.sockWrite(server.sockets, 'content-changed');
		});
	}
};












































