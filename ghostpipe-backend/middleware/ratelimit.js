const config = require("../config");

const genRatelimit = require("./ratelimit_generator");

module.exports = {
    criticalRatelimiter: genRatelimit(config.ratelimitOpts),
    videoDeliveryRatelimiter: genRatelimit(config.videoDeliveryRatelimitOpts),
    normalRatelimiter: genRatelimit(config.noncriticalRatelimitOpts)
}