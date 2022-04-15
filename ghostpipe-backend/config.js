const path = require("path");
const fs = require("fs");

try{
    fs.mkdirSync("/tmp/ghostpipe");
}catch(ex){
    console.log("Video tmpdir exists already. Not creating.")
}

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
        points: 60,
        duration: 15
    },
    maxConcurrentTasks: 3,
    port: process.env.PORT || 3003,
    video_lru: {
        max: 500
    },
    behind_proxy: true,
    pretty_print_debug: true,
    pipedInstances: [
        "pipedapi.kavin.rocks",
        "pipedapi.tokhmi.xyz",
        "pipedapi.notyourcomputer.net",
        "pa.il.ax"
    ],
    corsOrigin: [
        "http://localhost:3000",
        "http://localhost:3001",
        "https://ghostpipe.tad.us.eu.org"
    ],
    morganMode: "dev",
    videoSizeLimit: 1024*1024*1024*5,
    videoTempDir: "/tmp/ghostpipe",
    ytdlpPath: (process.env.YTDLP_CWD) ? path.join(process.cwd(), "yt-dlp") : "yt-dlp",
    taskRetentionTime: 4*60*60*1000, // 4 hours
    defaultHeaders:{
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/95.0.4638.50 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-us,en;q=0.5",
        "Sec-Fetch-Mode": "navigate"
    }
}

// GitPod helper
if(process.env.GITPOD_WORKSPACE_URL){
    let url = new URL(process.env.GITPOD_WORKSPACE_URL);
    url.hostname = "3003-" + url.hostname;
    module.exports.corsOrigin.push(url.toString());
}