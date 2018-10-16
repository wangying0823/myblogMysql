const router = require('koa-router')();
const userModel = require('../lib/mysql.js');
const md5 = require('md5');
const checkNotLogin = require('../middlewares/check').checkNotLogin;
const checkLogin = require('../middlewares/check').checkLogin;
const moment = require('moment');
const fs = require('fs');
// 注册页面 使用get方式得到’/signup’页面，然后渲染signup模板
router.get('/signup', async (ctx, next) => {
  await checkNotLogin(ctx);
  await ctx.render('signup',{
    session: ctx.session
  })
});
// 我们使用md5实现密码加密，长度是32位的
// 使用我们之前说的bodyParse来解析提交的数据，通过ctx.request.body得到
// 我们引入了数据库的操作 findDataByName和insertData，因为之前我们在/lib/mysql.js中已经把他们写好，并暴露出来了。意思是先从数据库里面查找注册的用户名，如果找到了证明该用户名已经被注册过了，如果没有找到则使用insertData增加到数据库中
// ctx.body 是我们通过ajax提交之后给页面返回的数据，比如提交ajax成功之后msg.data=1的时候就代表用户存在，msg.data出现在后面的signup.ejs模板ajax请求中
// 上传头像之前要新建好文件夹，我们ajax发送的是base64的格式，然后使用fs.writeFile来生成图片
// <% code %>：运行 JavaScript 代码，不输出
// <%= code %>：显示转义后的 HTML内容
// <%- code %>：显示原始 HTML 内容
// post 注册
router.post('/signup', async(ctx, next) => {
  let body = ctx.request.body;
  let user = {
    name: body.name,
    pass: body.password,
    repeatpass: body.repeatpass,
    avator: body.avator
  };
  await userModel.findUserData(user.name).then(async (result) => {
    if(result.length){
      try{
        throw Error('用户已经存在')
      }catch(err){
        //处理err
        console.log(error)
      }
      // 用户存在
      ctx.body = {
        data: 1
      };
    }else if(user.pass !== user.repeatpass || user.pass === ''){
      ctx.body = {
        data: 2
      };
    }else {
      let base64Data = user.avator.replace(/^data:image\/\w+;base64,/, "");
      let dataBuffer = new Buffer(base64Data, 'base64');
      let getName = Number(Math.random().toString().substr(3)).toString(36) + Date.now()
      await fs.writeFile('./public/images/' + getName + '.png', dataBuffer, err => { 
        if (err) throw err;
        console.log('头像上传成功') 
      });            
      await userModel.insertData([user.name, md5(user.pass), getName, moment().format('YYYY-MM-DD HH:mm:ss')])
        .then(res=>{
          console.log('注册成功',res)
          //注册成功
          ctx.body = {
            data: 3
          };
        })
    }
  })
})
module.exports = router;