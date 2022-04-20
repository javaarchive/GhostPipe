const config = require("../config");

const express = require("express");

const router = new express.Router();

console.log("Registered Video Downloads")
router.use(require("../middleware/ratelimit").videoDeliveryRatelimiter);
router.use(express.static(config.videoTempDir));

module.exports = router;