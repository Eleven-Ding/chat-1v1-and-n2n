//邮件发送
const nodemailer = require("nodemailer")
const { auth, from } = require('../config/e-mail-config')
//qq:需要发送的对象
//html:需要发送的内容
//subject:标题
let sendMail = function (qq, html, subject, callBack) {
    return new Promise((resolve, reject) => {
        let transporter = nodemailer.createTransport({
            service: 'qq',
            port: 465, // SMTP 端口
            secureConnection: true, // 使用了 SSL
            auth
        });
        let mailOptions = {
            from, // 发件地址
            to: qq, // 收件列表
            subject: subject, // 标题
            html: html
        }

        transporter.sendMail(mailOptions, function (error, response) {
            if (error) {
                reject(error)
            }
            resolve(response)
            transporter.close(); // 如果没用，关闭连接池
        });
    })

}
module.exports = sendMail;