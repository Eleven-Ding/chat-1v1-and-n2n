const login = require('../router/login');
const { es } = require('../utils/pool')

const myEscapeMiddleware = () => {
    return async function (ctx, next) {
        //获取ctx的post参数
        const { method } = ctx.req;
        if (method === "GET") {
            const {query} = ctx.request
    
           
            for (let key in query) {
                query[key] = es(query[key])
                query[key] = query[key].slice(1, query[key].length - 1)
            }
            console.log(query,'query');
            ctx.req.query = query
        } else if (method === "POST") {
            //获取body
            
            const { body } = ctx.request;
            
            console.log(body);
            for (let key in body) {
                body[key] = es(body[key])
                body[key] = body[key].slice(1, body[key].length - 1)
            }
            console.log(body);
            ctx.req.body = body
        }
        await next()
    }
}

module.exports = myEscapeMiddleware