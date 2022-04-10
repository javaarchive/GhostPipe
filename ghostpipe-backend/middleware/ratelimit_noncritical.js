// Source: https://github.com/animir/node-rate-limiter-flexible/wiki/Express-Middleware

const config = require("../config").ratelimitOpts;

const {RateLimiterMemory} = require('rate-limiter-flexible');

const rateLimiter = new RateLimiterMemory(config.ratelimitOpts);

function writeRatelimitHeaders(ratelimiterRes, res){
    res.set("Retry-After", ratelimiterRes.msBeforeNext / 1000);
    res.set("X-RateLimit-Limit", config.points);
    res.set("X-RateLimit-Remaining", ratelimiterRes.remainingPoints);
    res.set("X-RateLimit-Reset", new Date(Date.now() + ratelimiterRes.msBeforeNext));
}

const rateLimiterMiddleware = function (req, res, next) {
  rateLimiter.consume(req.ip)
    .then((ratelimiterRes) => {
        writeRatelimitHeaders(ratelimiterRes, res);
        next();
    })
    .catch((ratelimiterRes) => {
      writeRatelimitHeaders(ratelimiterRes, res);
      res.status(429).send('Too Many Requests');
    });
};

module.exports = rateLimiterMiddleware;