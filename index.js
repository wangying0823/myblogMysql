const Koa = require('koa');
const path = require('path');
const bodyParser = require('koa-bodyparser');
const ejs = require('ejs');
const session = require('koa-session-minimal');
const MysqlStore = require('koa-mysql-session');
const config = require('./config/default');
const router = require('koa-router');
const views = require('koa-views');
const staticCache = require('koa-static-cache');
const app = new Koa();
// session储存配置
const sessionMysqlConfig = {
  user: config.database.USERNAME,
  password: config.database.PASSWORD,
  database: config.database.DATABASE,
  host: config.database.HOST
};
// 配置session中间件
app.use(session({
  key: 'USER_SID',
  store: new MysqlStore(sessionMysqlConfig)
}))
// 配置静态资源加载中间件
// app.use(koaStatic(
//   path.join(__dirname,'./public')
// ))
// 缓存
app.use(staticCache(path.join(__dirname, './public'), {dynamic: true}, {
  maxAge: 365 * 24 * 60 * 60
}));
app.use(staticCache(path.join(__dirname, './images'), { dynamic: true }, {
  maxAge: 365 * 24 * 60 * 60
}))
// 配置服务端模板渲染引擎中间件
app.use(views(path.join(__dirname, './views'),{
  extension: 'ejs'
}))
// 表单解析
app.use(bodyParser({
  formLimit: '1mb'
}))
// 路由
app.use(require('./routers/signin.js').routes())
app.use(require('./routers/signup.js').routes())
app.use(require('./routers/posts.js').routes())
app.use(require('./routers/signout.js').routes())
// 监听
app.listen(3000);
console.log(`listening on port ${config.port}`)
// 我们使用koa-session-minimal``koa-mysql-session来进行数据库的操作
// 使用koa-static配置静态资源，目录设置为public
// 使用ejs模板引擎
// 使用koa-bodyparser来解析提交的表单信息
// 使用koa-router做路由
// 使用koa-static-cache来缓存文件
// 之前我们配置了default.js，我们就可以在这里使用了
// 首先引入进来 var config = require(‘./config/default.js’);
// 然后在数据库的操作的时候，如config.database.USERNAME，得到的就是root。