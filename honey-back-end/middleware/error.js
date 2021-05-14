async function onerror(ctx, next) {
    try {
        await next();
    } catch (err) {

        //可以在这里做一些异常处理
        console.log(err);
        ctx.app.emit('error', err);
        ctx.body = 'server error';
        ctx.status = err.status || 500;
    }
}

module.exports = onerror