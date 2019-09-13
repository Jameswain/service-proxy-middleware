<div>
  <h1 align="center">service-proxy-middleware</h1>
  <p>这是基于<a href="https://www.npmjs.com/package/http-proxy-middleware">http-proxy-middleware</a>实现的一个动态跨域代理中间件。为什么需要使用它？因为如果直接使用http-proxy-middleware会存在一个问题，就是每次修改代理配置都需要重启webpack-dev-server才能生效，不能实时看到效果，验证成本高。使用service-proxy-middleware有以下优点：</p>
</div>
​		1、实时性，修改跨域代理配置文件后，service-proxy-middleware会主动触发浏览器刷新，并读取最新的跨域配置，无需重启开发服务，验证成本低。

​		2、针对每个entry进行单独的跨域代理配置，便于维护

<h2 align="center">安装</h2>
```bash
npm i --save-dev service-proxy-middleware
```

```bash
yarn add --dev service-proxy-middleware
```

<h2 align="center">配置</h2>
| 名称          | 类型     | 默认值        | 描述                                                         |
| ------------- | -------- | ------------- | ------------------------------------------------------------ |
| filename      | {String} | proxyRules.js | 代理规则配置文件名称                                         |
| publicPath    | {String} | /             | webpack.devServer.publicPath 属性                            |
| webpackConfig | {Object} | 必传参数      | webpack配置                                                  |
| server        | {Object} | undefined     | webpack-dev-server对象，用于操作浏览器刷新，如果不传，代理配置文件发生改变时，不会触发浏览器刷新 |

<h2 align="center">使用</h2>
`service-proxy-middleware`目前支持三种类型的entry，分别是String、Array、Object，我针对这三种类型写了三个[example]()

<h3>String类型entry</h3>
