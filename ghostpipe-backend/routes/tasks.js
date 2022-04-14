const express = require('express');
const router = express.Router();

const child_process = require('child_process');

const fs = require('fs');
const path = require('path');

// Limiters
const {criticalRatelimiter} = require("../middleware/ratelimit");
const {normalRatelimiter} = require("../middleware/ratelimit");

// Video Data Accessor
const video_lru = require("../caches/video_lru");
const config = require('../config');

// Stream Helper
const Linestream = require("line-stream");

// ID Gen
const {nanoid} = require('nanoid');

// Download Task Manager
let ongoingTasks = [];
let finishedTasks = new Map();

function getVideoFromTasks(vid){
    return ongoingTasks.filter(task => task.videoID == vid)[0];
}

function getTask(id){
    return ongoingTasks.filter(task => task.id == id)[0];
}

function exitTask(id){
    finishedTasks.set(id, getTask(id));
    ongoingTasks = ongoingTasks.filter(task => task.id != id);
    setTimeout(() => {
        finishedTasks.delete(id);
    }, config.taskRetentionTime)
}

router.use(express.json());

// ffmpeg

const ffmpeg = require("fluent-ffmpeg");
if(process.env.USE_FFMPEG_STATIC_NPM_PKG == "1"){
    ffmpeg.setFfmpegPath(require("ffmpeg-static"))
}

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
            if(progress.downloaded_bytes){
                task.downloadedDecimal = progress.downloaded_bytes/progress.total_bytes;
                if(progress.filename){
                    let fnParts = progress.filename.split(".");
                    task.dest = progress.filename;
                    if(fnParts.length === 3 && fnParts[1].startsWith("f")){ // format num in the middle
                        task.dest = fnParts[0] + "." + fnParts[2];
                    }
                    console.log("Downloaded",task.downloadedDecimal*100,"%");
                }
            }else{
                // TODO: add something?
            }
        }
    });

    let cp = child_process.spawn(config.ytdlpPath,["-o",task.videoID+".%(ext)s","--format",task.formatID,"--progress-template","%(progress)j\n","https://youtube.com/watch?v=" + task.videoID],{
        cwd: config.videoTempDir
    });

    cp.stdout.pipe(lineStream);
    // cp.stderr.pipe(process.stderr);
    cp.on("exit", async code => {
        console.log("Task yt-dlp",task.videoID,"finished with code",code);
        task.status = "processing";
        task.downloadingVideo = false;
        task.processingVideo = true;
        if(code != 0){
            task.status = "error";
            task.error = "download failure";
            exitTask(task.id);
            return;
        }

        task.dest = (await fs.promises.readdir(config.videoTempDir)).filter(filename => filename.startsWith(task.videoID) &&
        !filename.endsWith(".tmp") && !filename.endsWith(".m3u8") && !filename.endsWith(".ts") )[0];

        // Fire off ffmpeg task
        const command = ffmpeg(path.join(config.videoTempDir, task.dest))
           // .audioCodec("libopus")
           // .audioBitrate(196) // yt max bitrate for m4a ig
            .outputOptions([
                "-vcodec libx264",
                "-hls_time 5",
                "-hls_playlist_type vod",
                "-hls_segment_filename " + path.join(config.videoTempDir,task.videoID+".%06d.ts")
            ])
            .output(path.join(config.videoTempDir,task.videoID+".m3u8"))
            .on("progress", (progress) => {
                console.log("Progress",progress);
                if(!progress.percent) return;
                task.processedDecimal = progress.percent/100;
                task.timemark = progress.timemark;
            })
            .on("error", (err) => {
                console.log("Error",err);
                task.status = "error";
                task.error = "Converter failure";
                exitTask(task.id);
            })
            .on("end", async () => {
                console.log("Task ffmpeg",task.videoID,"finished");
                task.status = "finished";
                task.processingVideo = false;
                task.playlists = 1;
                task.segFileList = (await fs.promises.readdir(config.videoTempDir)).filter(filename => filename.startsWith(task.videoID) && filename.endsWith(".ts"));
                task.segments = task.segFileList.length;
                exitTask(task.id);
            }).run()
            
    });
}

router.post("/submit_task",criticalRatelimiter, async (req, res) => {
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

    if(!req.body.formatID) return res.status(400).send("Invalid formatID");

    if(req.body.formatID.split("+").some(fid => {
        if(Number.isNaN(parseInt(fid))){
            let formatID = parseInt(fid);
            if(fid < 0 || fid > 1000){
                return true;
            }
        }
        return false;
    })){
        res.status(400).send("Invalid formatID");
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
        formatID: req.body.formatID,
        dest:null,
        downloadedDecimal: 0,
        processedDecimal: 0,
        id: nanoid(),
        timemark: '00:00:00.00'
    };

    console.log("New Task added",task.videoID,"vid");

    ongoingTasks.push(task);

    processTask(task);

    res.send(task.id);
});

router.get("/task_status/:id", (req, res) => {
    res.send(getTask(req.params.id) || finishedTasks.get(req.params.id));
});

router.get("/cached/:vid", (req, res) => {
    res.send(video_lru.has(req.params.vid));
});

router.get("/task_count", (req, res) => {
    res.send(ongoingTasks.length);
});

module.exports = router;