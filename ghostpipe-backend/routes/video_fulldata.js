const config = require("../config");

const child_process = require('child_process');
const util = require('util');
const execFile = util.promisify(child_process.execFile);

const fetch = require("node-fetch");

// Cache
const video_lru = require("../caches/video_lru");

const express = require('express');
const router = express.Router();

// Limiters
const {criticalRatelimiter} = require("../middleware/ratelimit");
const {videoDeliveryRatelimiter} = require("../middleware/ratelimit")
const {normalRatelimiter} = require("../middleware/ratelimit");
const { appendFile } = require("fs");

function preprocessVideoData(data){
    if(data.requested_downloads && data.requested_downloads.requested_formats){
        let withHTTPHeaders = data.requested_downloads.requested_formats.filter(f => f.http_headers)[0];
        if(withHTTPHeaders.length) data.http_headers = withHTTPHeaders[0].http_headers
    }
    return data;
}

function getSubtitles(videoData, lang){
    let subtitles = [];
    if(videoData.automatic_captions && videoData.automatic_captions[lang]){
        console.log("Found",videoData.automatic_captions[lang].length,"automatic captions. ");
        subtitles = subtitles.concat(videoData.automatic_captions[lang]);
    }
    if(videoData.subtitles && videoData.subtitles[lang]){
        console.log("Found",videoData.subtitles[lang].length,"subtitles. ");
        subtitles = subtitles.concat(videoData.subtitles[lang])
    }
    return subtitles;
}
console.log("Registered Video Endpoint");

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
            let {stdout,stderr,error} = await execFile(config.ytdlpPath,["-J","https://youtube.com/watch?v=" + id],  {maxBuffer: 1024 * 1024 * 5});
            if(error){
                console.log("Extraction Error",stderr,"stdout",stdout,"error",error);
                res.status(500).send("Extraction Error");
                return;
            }else{
                let video = JSON.parse(stdout);
                
                video = preprocessVideoData(video);

                video_lru.set(id,video);
                
                res.send(video);
                
            }
        }catch(err){
            console.warn("Video Fetch for ID",id,"failed",err);
            res.status(500).send("Internal Server Error trying to fetch video data");
        }
    }
});

console.log("Registered Subtitles Endpoint");

router.get("/subtitles/:vid", async (req, res) => {
    if(video_lru.has(req.params.vid)){
        let videoData = video_lru.get(req.params.vid);
        let httpHeaders = videoData.http_headers || config.defaultHeaders;
        let type = req.query.type || "json3";
        let name = req.query.lang || "English";
        let langCode = req.query.langCode || "en";
        let subtitles = getSubtitles(videoData, req.query.langCode);
        if(req.query.listing){
            res.send(subtitles);
            return;
        }
        let matchedSubtitles = subtitles.filter(subtitle => {
            return subtitle.name === name && subtitle.ext === type;
        });
        if(matchedSubtitles.length){
            let subtitle = matchedSubtitles[0];
            console.log("Fetching subtitles for video ID",req.params.vid,"name",name,"type",type);
            try{
                let resp = await fetch(subtitle.url,{
                    headers: httpHeaders
                });
                
                res.set("Content-Type", resp.headers.get("content-type"));
                resp.body.pipe(res);

            }catch(ex){
                console.log("Subtitle fetch network error",ex);
                res.status(500).send("Network error");
            }
        }else{
            res.status(404).send("Could not find subtitle within query");
        }
    }else{
        res.status(400).send("Video not in cache");
    }
});

module.exports = router;
module.exports.video_lru = video_lru;