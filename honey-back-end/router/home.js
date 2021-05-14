const Router = require('koa-router');
const home = new Router();
const { select, update, query } = require('../utils/pool')
const { handleSearch, handleAddFriend, handleGetApply, handleGetFriends, handleApply, handleGetMessage } = require("../service/home")

home.get('/search', async ctx => {
    console.log(ctx.req.query);
    const { email } = ctx.req.query

    if (!email) {
        return ctx.body = { data: null, message: "邮箱不合法~", status: 400 }
    }

    const result = await handleSearch(email)
    return ctx.body = { data: result[0], message: "查询成功~", status: 200 }
})
home.post('/add-friend', async ctx => {
    const { userId1, userId2 } = ctx.req.body;
    const result = await handleAddFriend(userId1, userId2)

    ctx.body = result
})


home.get('/get-apply', async ctx => {
    //获取userId
    const { userId } = ctx.req.query;
    const result = await handleGetApply(userId)
    return ctx.body = { data: result, message: 'search success', status: 200 }
})

home.get('/get-friends', async ctx => {
    const { userId } = ctx.req.query;
    const result = await handleGetFriends(userId)
    return ctx.body = { data: result, message: 'get success', status: 200 }
})

home.post('/handle-apply', async ctx => {
    const { userId1, userId2, type } = ctx.req.body;
    console.log(userId1, userId2, type);
    const result = await handleApply(userId1, userId2, type)
    console.log(result);

    ctx.body = result
    if (type == 1) {
        //查到userId2的socketId
        const result = await select(['socketId'], 'users', { userId: userId2 })
        //选userId1的信息
        const userInfo = await select(['avatar', 'userId', 'username'], 'users', { userId: userId1 })
        //取到id
        ctx.io.to(result[0].socketId).emit('access-apply', { ...userInfo[0] })
    }
})

home.get('/get-message', async ctx => {
    const { userId1, userId2 } = ctx.req.query;
    let result = []
    if (userId2 == -1) {
        result = await query(`select username,userId,avatar,message,type,message.createTime from message left join users on users.userId=message.userId1    where userId2=-1`)
      
        return ctx.body = result
    }
    result = await handleGetMessage(userId1, userId2);
    ctx.body = result
})

home.get('/get-no-red', async ctx => {

    const { userId } = ctx.req.query;

    const result = await select(['userId1'], 'message', { userId2: userId, isRed: 0 })

    let arr = [];
    let idx = []
    // console.log(result);
    for (let i = 0; i < result.length; i++) {
        // console.log(result[i]);
        let { userId1 } = result[i];
        // console.log(userId);
        let index = idx.indexOf(userId1)
        if (index !== -1) {
            //说明有
            //那到index
            arr[index].count = arr[index].count + 1
        } else {

            //说明没有 那么就push进去
            arr.push({
                userId: userId1,
                count: 1
            })
            idx.push(userId1)
        }
    }

    ctx.body = {
        data: arr
    }
})

home.post('/handle-all-no-read', async ctx => {
    const { userId1, userId2 } = ctx.req.body;
    console.log(userId1, userId2);
    // let sql = `update message set isRed=1 where userId1=${userId2} and userId2=${userId1};`
    // console.log(sql);
    const result = await query(`update message set isRed=1 where userId1=${userId1} and userId2=${userId2};`)

    ctx.body = {
        result
    }
})

module.exports = home