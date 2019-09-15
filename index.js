const url = require('url');
const utils = require('./lib/utils');

module.exports = (options) => {
	// 初始化配置
	// 代理配置文件名
	options.filename = options.filename || 'proxyRules.js';
	// 公共代理配置文件
	options.commonProxys = options.commonProxys || [];
	// webpack.devServer.publicPath
	options.publicPath = options.publicPath || '/';
	// 实时配置日志输出，默认为false，如果为true，则代理配置文件发生改变时，会更新终端输出的代理配置
	options.realtimeLog = options.realtimeLog || false;
	// webpack配置，必传参数
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
