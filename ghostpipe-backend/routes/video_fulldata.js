const config = require("../config");

const child_process = require('child_process');
const util = require('util');
const execFile = util.promisify(child_process.execFile);

// Cache
const video_lru = require("../caches/video_lru");

const express = require('express');
const router = express.Router();

// Limiters
const criticalRatelimiter = require("../middleware/ratelimit");
const videoDeliveryRatelimiter = require("../middleware/video_delivery")
const normalRatelimiter = require("../middleware/ratelimit_noncritical");

router.get("/video/:id",videoDeliveryRatelimiter, async (req,res) => {
    let id = req.params.id;
    if(id.length > 12){
        res.status(400).send("Invalid id");
        return;
    }
    let video = video_lru.get(id);
    if(video){
        res.send(video);
    }else{
        try{
            let {stdout,stderr,error} = await execFile("yt-dlp",["-J","https://youtube.com/watch?v=" + id]);
            if(error){
                console.log("Extraction Error",stderr,"stdout",stdout,"error",error);
                res.status(500).send("Extraction Error");
                return;
            }else{
                let video = JSON.parse(stdout);
                
                video_lru.set(id,video);
                
                res.send(video);
                
            }
        }catch(err){
            console.warn("Video Fetch for ID",id,"failed",err);
            res.status(500).send("Internal Server Error trying to fetch video data");
        }
    }
});

module.exports = router;
module.exports.video_lru = video_lru;