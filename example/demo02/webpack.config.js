const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const serviceProxyMiddleware = require('../../index');
module.exports = {
	mode: "development",
	entry: [
		path.join(process.cwd(), 'example/demo01/src/index.js'),
		path.join(process.cwd(), 'example/other/index.js')
	],
	output: {
		filename: '[name].[hash].js'
	},
	plugins: [
		new HtmlWebpackPlugin({
			title: 'proxy-index.html',
			filename: 'index.html'
		}),
		new HtmlWebpackPlugin({
			title: 'proxy-app.html',
			filename: 'app.html'
		}),
	],
	devServer: {
		before(app, server) {
			app.use(serviceProxyMiddleware({ webpackConfig: module.exports, server }));
		}
	}
}
