const url = require('url');
const utils = require('./lib/utils');

module.exports = (options) => {
	// 初始化配置
	options.filename = options.filename || 'proxyRules.js';
	// webpack.devServer.publicPath
	options.publicPath = options.publicPath || '/';
	// 必须要有webpack配置
	if (!options.webpackConfig) throw new Error('请传入webpack配置');
	// 获取entry与代理配置文件路径的映射
	options.mapProxyFiles = utils.getEntryWithProxyMap(options);
	// 读取代理配置文件内容
	options.mapProxyRules = utils.requireProxyFiles(options.mapProxyFiles);
	// 监听代理配置文件变化
	utils.watchProxyRuleFile(options);
	return (req, res, next) => {
		if (!req.headers.referer) return next();
		// 请求来源页面
		let referer = new url.URL(req.headers.referer).pathname;
		referer = referer.length <= 1 ? '/index.html' : referer;
		const proxyRule = options.mapProxyRules[referer];
		for (let filename in proxyRule) {
			const arrProxyRule = proxyRule[filename];
			for (let i = 0; i < arrProxyRule.length; i++) {
				if (!utils.contextMatch(arrProxyRule[i].context, req) || !arrProxyRule[i].enable) continue;
				// 运行跨域代理
				utils.runProxyRule(arrProxyRule[i], filename)(req, res, next);
				return;
			}
		}
		next();
	}
};
