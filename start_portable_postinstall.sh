#!/bin/bash
cd ghostpipe-frontend
echo Installing yt-dlp
wget https://github.com/yt-dlp/yt-dlp/releases/download/2022.04.08/yt-dlp
chmod +x yt-dlp
cd ..
source portable_env.sh
./start_backend.sh
