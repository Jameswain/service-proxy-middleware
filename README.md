<div>
  <h1 align="center">service-proxy-middleware</h1>
  <p>这是基于<a href="https://www.npmjs.com/package/http-proxy-middleware">http-proxy-middleware</a>实现的一个动态跨域代理中间件。为什么需要使用它？因为如果直接使用http-proxy-middleware会存在一个问题，就是每次修改代理配置都需要重启webpack-dev-server才能生效，不能实时看到效果，验证成本高。使用service-proxy-middleware有以下优点：</p>
</div>
​		1、实时性，修改跨域代理配置文件后，service-proxy-middleware会主动触发浏览器刷新，并读取最新的跨域配置，无需重启开发服务，验证成本低。

​		2、针对每个entry进行单独的跨域代理配置，便于维护

## 安装

```bash
npm i --save-dev service-proxy-middleware
```

```bash
yarn add --dev service-proxy-middleware
```

## 配置

| 名称          | 类型     | 默认值        | 描述                                                         |
| ------------- | -------- | ------------- | ------------------------------------------------------------ |
| filename      | {String} | proxyRules.js | 代理规则配置文件名称                                         |
| publicPath    | {String} | /             | webpack.devServer.publicPath 属性                            |
| webpackConfig | {Object} | 必传参数      | webpack配置                                                  |
| server        | {Object} | undefined     | webpack-dev-server对象，用于操作浏览器刷新，如果不传，代理配置文件发生改变时，不会触发浏览器刷新 |
| commonProxys  | {Array}  | []            | 公共代理配置文件                                             |
| realtimeLog  | {Boolean}  | false        | 实时配置日志输出，默认为false，如果为true，则代理配置文件发生改变时，会实时更新终端输出的代理配置 |

## 使用

`service-proxy-middleware`目前支持三种类型的entry，分别是String、Array、Object，我针对这三种类型写了三个[example](https://github.com/Jameswain/service-proxy-middleware/tree/master/example)

### String类型entry

**[webpack.config.js](https://github.com/Jameswain/service-proxy-middleware/blob/master/example/demo01/webpack.config.js)**

```javascript
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const serviceProxyMiddleware = require('../../index');
module.exports = {
	mode: "development",
	entry: path.join(process.cwd(), 'example/demo01/src/index.js'),
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
			app.use(serviceProxyMiddleware({
				webpackConfig: module.exports,
				server,
				// 公共代理配置文件
				commonProxys: [
					path.resolve(__dirname, '..', 'other', 'proxyRules.js')
				]
			}));
		}
	}
}
```

**[跨域代理配置文件：proxyRules.js](https://github.com/Jameswain/service-proxy-middleware/blob/master/example/demo01/src/proxyRules.js)**

**⚠️注意：这个跨域代理配置文件，必须放在跟entry文件的同级目录下。**

```javascript
module.exports = [
	{
		enable: true,
		context: [
			'/j/*'
		],
		target: 'https://movie.douban.com'
	},
	{
		enable: true,
		context: [
			'/passport'
		],
		target: 'http://news.baidu.com'
	},
	{
		enable: true,
		context: [
			'/mojiweather/**'
		],
		target: 'http://www.moji.com'
	}
]
```

**[entry文件：index.js](https://github.com/Jameswain/service-proxy-middleware/blob/master/example/demo01/src/index.js)**

```javascript
import axios from 'axios';
let result;
(async () => {
	try {
		result = await axios.get('/j/search_subjects?type=movie&tag=%E7%83%AD%E9%97%A8&page_limit=50&page_start=0');
		console.log('/j/search_subjects=>', result);
	} catch (e) {
		console.log(e)
	}
	
	try {
		result = await axios.get('/passport');
		console.log('/passport=>', result);
	} catch (e) {
		console.log(e);
	}
	
	try {
		result = await axios.get('/mojiweather/forecast.php');
		console.log('/mojiweather/forecast.php=>', result);
	} catch (e) {
		console.log(e)
	}
	
	try {
		result = await axios.get('/mojiweather/news.php');
		console.log('/mojiweather/news.php=>', result);
	} catch (e) {
		console.log(e)
	}
})();
```

```javascript
// 访问以下地址
http://localhost:8080/app.html
http://localhost:8080/index.html
http://localhost:8080
```

**运行效果：**

![01](https://raw.githubusercontent.com/Jameswain/IMG/master/20190914065644.jpg)

![02](https://raw.githubusercontent.com/Jameswain/IMG/master/20190914065809.jpg)

![03](https://raw.githubusercontent.com/Jameswain/IMG/master/20190914070332.jpg)

当webpack-dev-server启动后，当我们修改proxyRules.js文件时，浏览器会实时刷新并读取最新的代理配置，立马就能验证效果，这个在我们开发阶段非常有用，我们可以通过修改target随意切换接口的请求环境（测试、灰度、线上）。



### Array类型entry

****

**[webpack.config.js](https://github.com/Jameswain/service-proxy-middleware/blob/master/example/demo02/webpack.config.js)**

```javascript
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
```

**[跨域代理配置文件：proxyRules.js](https://github.com/Jameswain/service-proxy-middleware/blob/master/example/demo02/src/proxyRules.js)**

**⚠️注意：这个跨域代理配置文件，必须放在跟entry文件的同级目录下。**

```javascript
module.exports = [
	{
		enable: true,
		context: [
			'/j/*'
		],
		target: 'https://movie.douban.com'
	},
	{
		enable: true,
		context: [
			'/passport'
		],
		target: 'http://news.baidu.com'
	},
	{
		enable: true,
		context: [
			'/mojiweather/**'
		],
		target: 'http://www.moji.com'
	}
]
```

**[entry文件：index.js](https://github.com/Jameswain/service-proxy-middleware/blob/master/example/demo02/src/index.js)**

```javascript
import axios from 'axios';
let result;
(async () => {
	try {
		result = await axios.get('/j/search_subjects?type=movie&tag=%E7%83%AD%E9%97%A8&page_limit=50&page_start=0');
		console.log('/j/search_subjects=>', result);
	} catch (e) {
		console.log(e)
	}
	
	try {
		result = await axios.get('/passport');
		console.log('/passport=>', result);
	} catch (e) {
		console.log(e);
	}
	
	try {
		result = await axios.get('/mojiweather/forecast.php');
		console.log('/mojiweather/forecast.php=>', result);
	} catch (e) {
		console.log(e)
	}
	
	try {
		result = await axios.get('/mojiweather/news.php');
		console.log('/mojiweather/news.php=>', result);
	} catch (e) {
		console.log(e)
	}
})();
```

```javascript
// 访问以下地址
http://localhost:8080/app.html
http://localhost:8080/index.html
http://localhost:8080
```

**运行效果：**

![](https://raw.githubusercontent.com/Jameswain/IMG/master/20190914071641.jpg)

~![](https://raw.githubusercontent.com/Jameswain/IMG/master/20190914071712.jpg)



### Object类型entry

**[webpack.config.js](https://github.com/Jameswain/service-proxy-middleware/blob/master/example/demo03/webpack.config.js)**

```javascript
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
```

**[跨域代理配置文件：proxyRules.js](https://github.com/Jameswain/service-proxy-middleware/blob/master/example/demo03/src/proxyRules.js)**

**⚠️注意：这个跨域代理配置文件，必须放在跟entry文件的同级目录下。**

```javascript
module.exports = [
	{
		enable: true,
		context: [
			'/j/*'
		],
		target: 'https://movie.douban.com'
	},
	{
		enable: true,
		context: [
			'/passport'
		],
		target: 'http://news.baidu.com'
	},
	{
		enable: true,
		context: [
			'/mojiweather/**'
		],
		target: 'http://www.moji.com'
	}
]
```

**[entry文件：app.js](https://github.com/Jameswain/service-proxy-middleware/blob/master/example/demo03/src/app.js)**

```javascript
import axios from 'axios';
let result;
(async () => {
	console.log('app.js')
	try {
		result = await axios.get('/j/search_subjects?type=movie&tag=%E7%83%AD%E9%97%A8&page_limit=50&page_start=0');
		console.log('/j/search_subjects=>', result);
	} catch (e) {
		console.log(e)
	}
	
	try {
		result = await axios.get('/passport');
		console.log('/passport=>', result);
	} catch (e) {
		console.log(e);
	}
})();
```

**[entry文件：main.js](https://github.com/Jameswain/service-proxy-middleware/blob/master/example/demo03/src/main.js)**

```javascript
import axios from 'axios';
let result;
(async () => {
	console.log('main.js');
	try {
		result = await axios.get('/mojiweather/forecast.php');
		console.log('/mojiweather/forecast.php=>', result);
	} catch (e) {
		console.log(e)
	}
})();
```

**[entry文件：other/index.js](https://github.com/Jameswain/service-proxy-middleware/blob/master/example/other/index.js)**

```javascript
import axios from 'axios';
let result;
(async () => {
	console.log('other.js...');
	
	try {
		result = await axios.get('/mojiweather/news.php');
		console.log('/mojiweather/news.php=>', result);
	} catch (e) {
		console.log(e)
	}
})();
```

**[跨域代理配置文件：other/proxyRules.js](https://github.com/Jameswain/service-proxy-middleware/blob/master/example/other/proxyRules.js)**

```javascript
module.exports = [
	{
		enable: true,
		context: [
			'/mojiweather/**'
		],
		target: 'http://www.moji.com'
	}
]
```

```javascript
// 访问以下地址
http://localhost:8080/react/index.html
http://localhost:8080/react/app.html
```

**运行效果：**

![](https://raw.githubusercontent.com/Jameswain/IMG/master/20190914075903.jpg)

![](https://raw.githubusercontent.com/Jameswain/IMG/master/20190914075926.jpg)

![](https://raw.githubusercontent.com/Jameswain/IMG/master/20190914075953.jpg)
