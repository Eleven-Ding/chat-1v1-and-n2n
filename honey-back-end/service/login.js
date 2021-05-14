const { query, select, update, insert, remove } = require("../utils/pool")
const { handleRandom } = require("../utils/handles")
const { loginTemplate } = require("../constants/html-template")
const sendMail = require("../utils/email")
const { CACHE_TIME } = require('../constants/constant')
const { signToken } = require('../utils/jwt')
const handleSendEmail = async (email) => {
    const emailCount = await select(['count(1)'], 'cache', { email })
    let result = null;
    const code = handleRandom()
    if (emailCount[0]["count(1)"] === 1) {
        //如果有 更新
        try {
            result = await update('cache', { code }, { email })
        } catch (e) {
            result = null
        }
    } else {
        //如果没有的话 那么就插入
        try {
            result = insert('cache', { code, email })
        } catch (e) {
            result = null
        }
    }
    await sendMail(email, loginTemplate(code), "登陆验证码")
    //在插入之前都发送邮件
    return result
}
//处理注册 1.检查code是否合法(正确并且在有效期内) 2.检查是否注册过了 3.如果都没有则往里面插入数据
const handleRegister = async (email, username, password, code) => {

    //拿到先
    if (!checkCodeLegal(code, email)) {
      
        return { data: {}, message: '验证码不正确或者已过期', status: 400 }
        //code email合法后检查是否注册过了
    } else {
       
        // const count = 
        if ((await checkIsRegister(email))) {
            return { data: {}, message: "您已经注册过了", status: 400 }
        } else {
            const avatar = `https://q.qlogo.cn/headimg_dl?dst_uin=${email.split('@')[0]}&spec=100`
            //没有注册就插入并且签发token
            await insert('users', { username, password, email, avatar, createTime: Date.now() })
            //删除这一行 
            await remove('cache', { email, code })
            return { data: {}, message: '注册成功', status: 200 }
        }
    }
}
const checkCodeLegal = async (code, email) => {
    const now = Date.now();
    //先匹配code email
    const countResult = await select(['*'], 'cache', { code, email });
    console.log("select");

    if (countResult.length === 0) {
        return false
    } else {
        const result = countResult[0];
        const date = result.updateTime;
        if (now - Number(new Date(date)) > CACHE_TIME * 1000 * 60) {
            return false
        }

    }

    return true
}
const checkIsRegister = async (email) => {

    const result = await select(['count(1)'], 'users', { email })
  
    return result[0]['count(1)']
}


const handleLogin = async (email, password) => {
    const result = await select(['userId', 'avatar', 'username', 'email'], 'users', { email, password })
   
    if (result.length > 0) {
        const token = signToken(email)
        return {userInfo:result[0],token}
    }
    return null
}


module.exports = {
    handleSendEmail,
    handleRegister,
    handleLogin
}