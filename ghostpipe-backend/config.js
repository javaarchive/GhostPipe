module.exports = {
    ratelimitOpts: {
        // Passed to https://www.npmjs.com/package/rate-limiter-flexible
        points: 2,
        duration: 60
    },
    noncriticalRatelimitOpts: {
        // Passed to https://www.npmjs.com/package/rate-limiter-flexible
        points: 6,
        duration: 15
    },
    videoDeliveryRatelimitOpts: {
        // Passed to https://www.npmjs.com/package/rate-limiter-flexible
        points: 4,
        duration: 15
    },
    maxConcurrentTasks: 3,
    port: process.env.PORT || 3003,
    video_lru: {
        max: 500
    },
    behind_proxy: false,
    pretty_print_debug: true,
    pipedInstances: [
        "pipedapi.kavin.rocks",
        "pipedapi.tokhmi.xyz",
        "pipedapi.notyourcomputer.net",
        "pa.il.ax"
    ]
}