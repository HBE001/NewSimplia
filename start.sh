#!/bin/sh
#cd /home/lotusinterworks.internal/codeDeploy/FrontEndIntegrationJumpStart-20151214
sudo su
cd /home/lotusinterworks.internal/codeDeploy/NewSimplia
chmod +x setup_nginx_debug_repo.sh
./setup_nginx_debug_repo.sh NewSimplia_Simplia 3011 3012

cp -r /home/lotusinterworks.internal/codeDeploy/FrontEndIntegrationJumpStart-20151214/simplia /home/lotusinterworks.internal/codeDeploy/NewSimplia/simplia || true
cp -rf simplia_update/* simplia/
cd simplia
export NODE_PATH=/usr/local/lib/node_modules
#pm2 start /home/lotusinterworks.internal/codeDeploy/NewSimplia/simplia/index.js --node-args="--debug=3012" --force --name "NewSimplia_Simplia"
sudo node --debug=3012 index.js