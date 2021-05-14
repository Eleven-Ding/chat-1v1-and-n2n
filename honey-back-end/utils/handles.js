function handleRes(data = {}, message = "success!", status = "200") {
    return {
        data,
        message,
        status
    }
}
function handleRandom(n = 4) {
    let code = ""
    for (let i = 0; i < n; i++) {
        code += parseInt(Math.random() * 10)
    }
    return code
}

module.exports = {
    handleRes,
    handleRandom
}