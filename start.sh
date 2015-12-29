#!/bin/sh
cd /home/lotusinterworks.internal/yahyas/simpliadeployment
sudo chmod +x setup_nginx_debug_repo.sh
#sudo ./setup_nginx_debug_repo.sh HelloWorldApp 3001 3002
#sudo pm2 start /home/lotusinterworks.internal/yahyas/simpliadeployment/app.js --node-args="--debug=3002" --force

sudo ./setup_nginx_debug_repo.sh SimpliaApp 3006 3007
cd simplia
#export NODE_PATH= ../node_modules
export NODE_PATH=/usr/local/lib/node_modules
sudo pm2 start /home/lotusinterworks.internal/yahyas/simpliadeployment/simplia/index.js --node-args="--debug=3007" --force

