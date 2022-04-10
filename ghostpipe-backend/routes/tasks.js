const express = require('express');
const router = express.Router();

// Limiters
const criticalRatelimiter = require("../middleware/ratelimit");
const normalRatelimiter = require("../middleware/ratelimit_noncritical");

// Download Task Manager
let ongoingTasks = [];

router.use(express.json());

router.get("/submit_task",criticalRatelimiter, async (req, res) => {
    if(ongoingTasks.length >= config.maxConcurrentTasks){
        res.status(503).send("Task counted exceeded");
    }
    // Validate
    if(!req.body.url){
        res.status(400).send("Missing url");
    }

    pendingTasks.push({

    });
});

router.get("/task_count", (req, res) => {
    res.send(ongoingTasks.length);
});

module.exports = router;