#!/bin/sh
echo Installing npm packages
cd ghostpipe-backend
echo Installing backend packages
npm install
cd ..
cd ghostpipe-frontend
echo Installing frontend packages
npm install
cd ..
./install_binaries.sh