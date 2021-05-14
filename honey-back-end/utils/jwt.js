const jwt = require("jsonwebtoken");
const { secret } = require("../constants/constant")

const signToken = (payload) => {
    //签发token
    return jwt.sign(payload, secret)
}

const verify = (token) => {
    return new Promise((resolve, reject) => {
        jwt.verify(token, secret, (err, decode) => {
            if (err) {
                reject(false)
            }
            resolve(true)
        });
    })
}

module.exports = {
    signToken,
    verify
}