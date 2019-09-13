const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const serviceProxyMiddleware = require('../../index');
const publicPath = '/react';
module.exports = {
	mode: "development",
	entry: {
		app: path.resolve(process.cwd(), 'example/demo03/src/app.js'),
		main: [
			path.resolve(process.cwd(), 'example/demo03/src/main.js'),
			path.resolve(process.cwd(), 'example/other/index.js')
		]
	},
	output: {
		filename: '[name].[hash].js'
	},
	plugins: [
		new HtmlWebpackPlugin({
			title: 'proxy-app.html',
			filename: 'app.html',
			chunks: [ 'app' ]
		}),
		new HtmlWebpackPlugin({
			title: 'proxy-index.html',
			filename: 'index.html'
		}),
	],
	devServer: {
		publicPath,
		before(app, server) {
			app.use(serviceProxyMiddleware({ webpackConfig: module.exports, server, publicPath }));
		}
	}
}
