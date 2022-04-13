const config = require("../config");

const express = require("express");

const router = new express.Router();

router.use(require("../middleware/ratelimit").videoDeliveryRatelimiter);
router.use(express.static(config.videoTempDir));

module.exports = router;