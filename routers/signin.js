const router = require('koa-router')();
const userModel = require('../lib/mysql.js');
const md5 = require('md5');
const checkNotLogin = require('../middlewares/check').checkNotLogin;
const checkLogin = require('../middlewares/check').checkLogin;

router.get('/signin', async (ctx, next) => {
  await checkNotLogin(ctx);
  await ctx.render('signin', {
    session: ctx.session
  })
})
// 我们进行登录操作，判断登录的用户名和密码是否有误，使用md5加密
// 我们可以看到登录成功返回的结果是result 结果是这样的一个json数组：id：4 name：rrr pass：…
// [ RowDataPacket { id: 4, name: ‘rrr’, pass: ‘44f437ced647ec3f40fa0841041871cd’ } ]
router.post('/signin', async (ctx, next) => {
  let name = ctx.request.body.name;
  let pass = ctx.request.body.password;
  await userModel.findUserData(name).then((result)=>{
    let res = result;
    if(name === res[0]['name'] && md5(pass) === res[0]['pass']){
      ctx.body = true;
      ctx.session.user = res[0]['name'];
      ctx.session.id = res[0]['id'];
    }else {
      ctx.body = false;
    }
  }).catch(err => {
    console.log(err)
  })
})
module.exports = router;