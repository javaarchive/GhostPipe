const express = require('express');
const router = express.Router();

const child_process = require('child_process');

const fs = require('fs');
const path = require('path');

// Limiters
const criticalRatelimiter = require("../middleware/ratelimit");
const normalRatelimiter = require("../middleware/ratelimit_noncritical");

// Video Data Accessor
const video_lru = require("../caches/video_lru");
const config = require('../config');

// Stream Helper
const Linestream = require("line-stream");

// ID Gen
const {nanoid} = require('nanoid');

// Download Task Manager
let ongoingTasks = [];

function getVideoFromTasks(vid){
    return ongoingTasks.filter(task => task.videoID == vid)[0];
}

function getTask(id){
    return ongoingTasks.filter(task => task.id == id)[0];
}

router.use(express.json());

// ffmpeg

const ffmpeg = require("fluent-ffmpeg");

async function processTask(task){
    task.status = "preparing";
    task.downloadingVideo = true;
    // "%(progress.filename)s,%(progress.downloaded_bytes)s,%(progress.total_bytes)s,%(progress.total_bytes_estimate)s" old ptemplate

    let lineStream = Linestream("\n");
    lineStream.on("data",data => {
        let strData = data;
        if(Buffer.isBuffer(data)){
            strData = data.toString().replace(new RegExp("\r","g"),"");
        }
        console.log("Got line",strData.replace("\n","\\n"));
        if(strData.startsWith("{")){
            let progress = JSON.parse(strData);
            task.downloadedDecimal = progress.downloaded_bytes/progress.total_bytes;
            task.dest = progress.filename;
            console.log("Downloaded",task.downloadedDecimal*100,"%");
        }
    });

    let cp = child_process.spawn("yt-dlp",["-o",task.videoID+".%(ext)s","--progress-template","%(progress)j\n","https://youtube.com/watch?v=" + task.videoID],{
        cwd: config.videoTempDir
    });

    cp.stdout.pipe(lineStream);
    // cp.stderr.pipe(process.stderr);
    cp.on("exit",code => {
        console.log("Task yt-dlp",task.videoID,"finished with code",code);
        task.status = "processing";
        task.downloadingVideo = false;
        task.processingVideo = true;
        // Fire off ffmpeg task
        const command = ffmpeg(path.join(config.videoTempDir, task.dest || fs.readdirSync(config.videoTempDir).filter(filename => filename.startsWith(task.videoID) &&
         !filename.endsWith(".tmp") && !filename.endsWith(".m3u8") && !filename.endsWith(".ts") )[0])).
            audioCodec("libopus")
            .audioBitrate(196)
            .outputOptions([
                "-codec: copy",
                "-hls_time 10",
                "-hls_playlist_type vod",
                "-hls_segment_filename " + path.join(config.videoTempDir,task.videoID+".%03d.ts")
            ])
            .output(path.join(config.videoTempDir,task.videoID+".m3u8"))
            .on("progress", (progress) => {
                console.log("Progress",progress);
            })
            .on("error", (err) => {
                console.log("Error",err);
                task.status = "error";
                task.error = "Converter failure";
            })
            .on("end", (req, res) => {
                console.log("Task ffmpeg",task.videoID,"finished");
                task.status = "finished";
                task.processingVideo = false;
                task.playlists = 1;
            }).run()
            
    });
}

router.get("/submit_task",criticalRatelimiter, async (req, res) => {
    if(ongoingTasks.length >= config.maxConcurrentTasks){
        res.status(503).send("Task counted exceeded");
    }
    // Validate
    if(!req.body.vid){
        res.status(400).send("Missing video id");
    }

    if(!video_lru.has(req.body.vid)){
        res.status(400).send("Video not found in cache, request using videos endpoint first. ");
    }

    if(!req.body.formatID || Number.isNaN(parseInt(req.body.formatID))){
        let formatID = parseInt(req.body.formatID);
        if(formatID < 0 || formatID > 1000){
            res.status(400).send("Invalid formatID");
        }
    }

    let task = {
        videoID: req.body.vid,
        videoData: video_lru.get(req.body.vid),
        status: "pending",
        startTime: Date.now(),
        segements: -1,
        playlists: -1,
        processingVideo: false,
        downloadingVideo: false,
        formatID: parseInt(req.body.formatID),
        dest:null,
        id: nanoid()
    };

    console.log("New Task added",task.videoID,"vid");

    ongoingTasks.push(task);

    processTask(task);

    res.send(task.id);
});

router.get("/task_status/:id", (req, res) => {
    res.send(getTask(req.params.id));
});

router.get("/cached/:vid", (req, res) => {
    res.send(video_lru.has(req.params.vid));
});

router.get("/task_count", (req, res) => {
    res.send(ongoingTasks.length);
});

module.exports = router;