// Source: https://github.com/animir/node-rate-limiter-flexible/wiki/Express-Middleware

const {RateLimiterMemory} = require('rate-limiter-flexible');

function generateRatelimitMiddleware(config){
  const rateLimiter = new RateLimiterMemory(config);

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

  return rateLimiterMiddleware;
}

module.exports = generateRatelimitMiddleware;