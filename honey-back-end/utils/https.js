const https = require("https");
const fs = require("fs");
function useHttps(app) {
    const options = {
        key: fs.readFileSync("./ssl/ssl.key", "utf8"),
        cert: fs.readFileSync("./ssl/ssl.pem", "utf8")
    };
    const server = https.createServer(options,app.callback())
    return server
}

module.exports = useHttps