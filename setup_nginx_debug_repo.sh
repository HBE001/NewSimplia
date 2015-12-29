#!/bin/sh

PATH="/home/lotusinterworks.internal/yahyas/nginx_debug_repos_conf/"
#PATH="/home/lotusinterworks.internal/yahyas/nginx_debug_repos_conf/"

REPO=$1;
DEBUG_PORT=$2;
LOCAL_DEBUG_PORT=$3;


FILE=$PATH$REPO".conf"

/bin/cat <<EOM >$FILE

server {
    listen $DEBUG_PORT;

    location / {
        proxy_pass http://localhost:$LOCAL_DEBUG_PORT;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header Host \$http_host;
        proxy_set_header X-NginX-Proxy true;

    }
}

EOM

/usr/bin/sudo service nginx restart
#sudo service nginx restart