const Router = require('koa-router');
const login = new Router();
const { handleRes } = require('../utils/handles')
const { handleSendEmail, handleRegister, handleLogin } = require("../service/login")
// login.get('/', async ctx => {
//     ctx.body = {
//         message: 2333
//     }
// })

login.post('/register', async ctx => {
    const { password, email, username, code } = ctx.req.body
    const result = await handleRegister(email, username, password, code)
    console.log('123', result);
    ctx.body = result
})

login.post('/send-mail', async ctx => {
   
    const { email } = ctx.req.body;
    if (email === "") {
        return ctx.body = handleRes({
            message: 'error!'
        })
    }
    
    //根据email处理数据
    const results = handleSendEmail(email)
    if (!results) {
        return ctx.body = handleRes({
        }, "验证码发送失败,请检查QQ邮箱是否正确", 500)
    }
    ctx.body = handleRes({

    }, "验证码已发送，请注意查收!")

})
login.post('/', async ctx => {
    const { email, password } = ctx.req.body
    // console.log('手机端登陆');
    const result = await handleLogin(email, password)
    if (result) {
        // console.log(result);
        return ctx.body = { data: result, message: "登陆成功！", status: 200 }
    }

    return ctx.body = { data: null, message: "密码错误！", status: 400 }
})
module.exports = login