const Koa = require("koa");
const app = new Koa();
const Router = require('koa-router')
const bodyParser = require('koa-bodyparser')
const useHttps = require("./utils/https")
const myEscapeMiddleware = require("./middleware/escape")
const server = useHttps(app)
const { update, insert, select } = require("./utils/pool")
const { verify } = require('./utils/jwt')
const io = require('socket.io')(server, {
    cors: true
});

const login = require("./router/login");//router
const home = require("./router/home");

//跨域
app.use(async (ctx, next) => {

    // console.log(ctx.url);
    ctx.set("Access-Control-Allow-Origin", "*")
    ctx.set("Access-Control-Allow-Methods", "OPTIONS, GET, PUT, POST, DELETE");
    ctx.set("Access-Control-Allow-Headers", "content-type,authorization");
    ctx.set('Access-Control-Allow-Credentials', true)
    ctx.io = io;
    if (ctx.method === "POST" && ctx.url !== '/login' && ctx.url !== '/login/send-mail' && ctx.url != '/login/register') {
        const token = ctx.headers.authorization
        const result = await verify(token)
        // console.log(result);
        if (!result) {
            return ctx.body = { data: {}, message: "403 no policy", status: 403 }
        }
    }


    await next()
});

app.use(bodyParser())
//转义参数 防止sql注入
app.use(myEscapeMiddleware())

//挂载路由
let router = new Router()

router.use('/login', login.routes(), login.allowedMethods())
router.use('/home', home.routes(), home.allowedMethods())
app.use(router.routes()).use(router.allowedMethods())

// socket连接
io.on('connection', (socket) => {

    socket.on("login", async (e) => {
        const { userId } = e
        await update('users', { socketId: socket.id }, { userId })

        //把userId 更新socketId
    })
    socket.on("msg", async (data) => {
        console.log(data);
        const { userId1, userId2, type, message } = data;

        //先往数据库里插入一条数据
        const result = await insert("message", { userId1, userId2, type, message })
        //找到对应的userId2
        const result1 = await select(['avatar', 'username'], 'users', { userId: userId1 })
        const result2 = await select(['socketId'], 'users', { userId: userId2 })
        //群聊消息
        console.log(userId2,'userId2');
        if (userId2 == -1) {
            io.emit("handle-message", { ...result1[0], message, type, time: Date.now(), userId: -1 })
        } else {
            io.to(result2[0].socketId).emit('handle-message', { ...result1[0], message, type, time: Date.now(), userId: userId1 });
        }
        // console.log(result1[0].socketId);
    })

    socket.on("apply-friend", async (data) => {
        //查找到userId 

        const { userId1, userId2 } = data
        console.log('申请', userId1, userId2);
        //找到userId1的socket.id 
        //找到userId2的信息 
        const socketIds = await select(['socketId'], 'users', { userId: userId1 })
        console.log(socketIds);
        const userInfo = await select(['username', 'avatar', 'userId'], 'users', { userId: userId2 })
        console.log(socketIds[0].socketId, '发送申请');
        io.to(socketIds[0].socketId).emit('get-apply', { ...userInfo[0] });
    })
    socket.emit('init', 233)
    console.log("链接成功");
});

server.listen(8003, () => {
    console.log('running on 8003');
});



