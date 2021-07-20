// 01-middleware/index.js
const express = require('express');
const app = express();
 

// 创建中间件
function simpleMiddleware(request, response, next) {
  console.log('simple-middleware.originalUrl=>', request.originalUrl);
  next(); // 调用栈中的下一个中间件
}
 
function serviceProxyMiddleware(option) {
  console.log('service-proxy-中间件初始化', option);
  return (request, response, next) => {
    console.log('serviceProxyMiddleware=>', request.pathname);
    response.send('<h1>Hello Service-Proxy-Middleware</h1>'); // 直接返回数据，不会调用下一个中间件
    next();
  }
}
 
app.use(simpleMiddleware); // 应用中间件，该服务任何的请求都会被这个中间件拦截到
app.use(serviceProxyMiddleware({ webpackConfig: {} })); // 应用中间件
 
 
app.listen(9999, () => {
  console.log('服务启动成功，端口9999');
}); // 启动服务