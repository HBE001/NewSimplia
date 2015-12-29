#!/bin/sh
#cd /home/lotusinterworks.internal/codeDeploy/FrontEndIntegrationJumpStart-20151214

cd /home/lotusinterworks.internal/codeDeploy/NewSimplia
sudo chmod +x setup_nginx_debug_repo.sh
sudo ./setup_nginx_debug_repo.sh NewSimplia_Simplia 3011 3012

sudo cp -r /home/lotusinterworks.internal/codeDeploy/FrontEndIntegrationJumpStart-20151214/simplia /home/lotusinterworks.internal/codeDeploy/NewSimplia/Yahya/simplia || true
cd /home/lotusinterworks.internal/codeDeploy/NewSimplia/Yahya/simplia
export NODE_PATH=/usr/local/lib/node_modules
sudo pm2 start /home/lotusinterworks.internal/codeDeploy/NewSimplia/Yahya/simplia/index.js --node-args="--debug=3012" --force --name "NewSimplia_Simplia"

#sudo node --debug=3012 index.js