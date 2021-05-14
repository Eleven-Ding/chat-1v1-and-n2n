const { query, select, update, insert, remove } = require("../utils/pool")


const handleSearch = async (email) => {
    let result
    try {
        result = await select(['username,avatar,userId'], 'users', { email })
    } catch (e) {
        result = null
    }
    return result

}

const handleAddFriend = async (userId1, userId2) => {
    // console.log(userId1,223333,userId2);
    //加两个
    // let message = {}
    //先查找是否添加过了
    const count1 = await select(['*'], "friends", { userId1, userId2 })
    if (count1.length !== 0) {
        return { data: {}, message: "已添加或者没同意,请等待", status: 400 }
    }
    const count2 = await select(['*'], 'friends', { userId2, userId1 })
    if (count2.length !== 0) {
        return { data: {}, message: "已添加或者没同意,请等待", status: 400 }
    }
    //没添加 那么就插入  userId1 为被添加的
    await insert('friends', { userId1, userId2 });

    //这里可以搞一个推送 推送给对方。
    return { data: {}, message: "申请已发送,请等待", status: 200 }
}

const handleGetApply = async (userId) => {
    //根据userId 获取 agree = 0 并且 userId1 = userId 然后找到这些
    // console.log(userId);
    const result = await query(`select userId,avatar,username from users left join friends on users.userId=friends.userId2 where userId1=${userId}   and agree=0`)
    return result
}

const handleGetFriends = async (userId) => {
    const list1 = await query(`select userId,avatar,username from users left join friends on users.userId=friends.userId2 where userId1=${userId} and agree=1`)
    const list2 = await query(`select userId,avatar,username from users left join friends on users.userId=friends.userId1 where userId2=${userId} and agree=1`)

    return [...list1, ...list2]
}

const handleApply = async (userId1, userId2, type) => {//type表示是否通过
    
    if (type == 2) {
        //删除这条请求 
        const pp = await remove('friends', { userId1, userId2, agree: 0 })
        console.log(pp);
        return { data: {}, message: "删除成功", status: 200 }
    } else if (type == 1) {
        await update('friends', { agree: 1 }, { userId1, userId2 })
        //在这里socket.send一个东西
        return { data: {}, message: "好友通过～", status: 200 }
    }
}

const handleGetMessage = async (userId1, userId2) => {
    
    //获取20条数据
    console.log(userId1, userId2);
    //先找我发给他的
    const result1 = await select(['message', 'type', 'createTime'], 'message', { userId1, userId2 })
    const result1Info = await select(['username', 'avatar', 'userId'], 'users', { userId: userId1 })
    const list1 = result1.map((item => {
        // console.log(item);
        return { ...item, ...result1Info[0] }
    }))

    // console.log(list1);
    //在再找他发给我的

    const result2 = await select(['message', 'type','createTime'], 'message', { userId1: userId2, userId2: userId1 })
    const result2Info = await select(['username', 'avatar', 'userId'], 'users', { userId: userId2 })
    const list12 = result2.map((item => {
        return { ...item, ...result2Info[0] }
    }))

  
    return [...list1, ...list12].sort((a,b)=>{
        return Number(new Date(a.createTime)-Number(new Date(b.createTime)))
    })
}

module.exports = {
    handleSearch,
    handleAddFriend,
    handleGetApply,
    handleGetFriends,
    handleApply,
    handleGetMessage
}