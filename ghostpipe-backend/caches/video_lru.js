const config = require("../config");

const LRU = require('lru-cache');

module.exports = new LRU(config.video_lru);