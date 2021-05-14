//  mysql的连接池 
const mysql = require("mysql");
const database = require("../config/dbconfig")
const pool = mysql.createPool(database)

const connection = function (sql, options, callback) {
    
    pool.getConnection(function (err, conn) {
        if (err) {
            callback(err, null, null);
        } else {
            // console.log(sql,options,callback);
            conn.query(sql, options, function (err, results, fields) {
                //释放连接
                conn.release();
                //事件驱动回调
                callback(err, results, fields);
            });
        }
    });
};


function mysqlEscape(param) {
    return mysql.escape(param)
}


//query提供给一些繁杂的sql语句 其他的全部用 下面封装好的
function query(sql) {
    return new Promise((resolve, reject) => {
        connection(sql,[],(err, raw) => {
            if (err) {
                reject(err)
            }
            resolve(raw)
        })
    })
}

//这里封装一些简单的操作
//1.select
const select = (target, table, condition) => { //targetStr 例子 select * from  则targetStr =     
    target = target.join(',');//toString 应该是逗号隔开
    let sql = `select ${target} from ${table} `
    //如果存在条件 那么就用and处理一下  condition 约定为 {id:3,name:'dsy}
    sql += handleConditions(condition)

    return query(sql)
}
//2.update
const update = (table, target, condition) => {
    let sql = `update ${table} set `
    let str = "";
    for (let key in target) {
        const value = target[key];
        if (typeof value === 'string') {
            str += `${key}='${value}' ,`
        } else {
            str += `${key}=${value} ,`
        }
    }
    str = str.slice(0, str.length - 1)
    sql += str
    sql += handleConditions(condition)

    return query(sql)
}
//3.delete 
const remove = (table, condition) => {
    let sql = `delete from ${table} ` + handleConditions(condition)
    return query(sql)
}

//4.insert
const insert = (table, condition) => {
    //insert into table (aa,bb)values('','','',)
    let sql = `insert into ${table} `
    let str1 = "(", str2 = "(";
    for (let key in condition) {
        let item = condition[key];
        if (typeof item === 'string') {
            item = `'${item}'`
        }
        str1 += `${key},`
        str2 += `${item},`
    }
    str1=str1.slice(0,str1.length-1)+')'
    str2=str2.slice(0,str2.length-1)+')'
    sql = sql+str1+'values'+str2;

    return query(sql)
}
function handleConditions(condition) {
    let limitStr = ""
    if (condition) {
        limitStr = "where "
        for (let key in condition) {
            const value = condition[key];
            if (typeof value === 'string') {
                limitStr += `${key}='${value}' and `
            } else {
                limitStr += `${key}=${value} and `
            }

        }
        limitStr = limitStr.slice(0, limitStr.length - 4)
    }
    return limitStr
}
module.exports = {
    query,
    es: mysqlEscape,
    select,
    update,
    remove,
    insert
}