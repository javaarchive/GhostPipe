#!/bin/sh
echo Installing Binaries
cd ghostpipe-backend
echo Downloading FFMPEG via npm
npm install derhuerst/http-basic
npm install ffmpeg-static@4.2.4
export USE_FFMPEG_STATIC_NPM_PKG=1
echo Installing yt-dlp
export YTDLP_CWD=1
wget https://github.com/yt-dlp/yt-dlp/releases/download/2022.04.08/yt-dlp
chmod +x yt-dlp
cd ..
