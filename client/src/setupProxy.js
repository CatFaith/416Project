//配置所有带api的请求转发到服务器
const { createProxyMiddleware } = require('http-proxy-middleware');
module.exports = function(app) {
    app.use(
        '/api',
        createProxyMiddleware({
            target: 'http://localhost:3000',
            changeOrigin: true,
            pathRewrite: {
                "^/api": ""
            },
            onProxyReq: function onProxyReq(proxyReq, req, res) {

            },
        })
    );
};