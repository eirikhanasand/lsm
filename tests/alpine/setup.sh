#!/bin/bash

# Exits on error
set -e

# Checks if required environment variables are set
if [[ -z "$JFROG_EMAIL" || -z "$JFROG_TOKEN" || -z "$JFROG_ID" || -z "$ALPINE_IP" ]]; then
  echo "Error: ALPINE_IP, JFROG_EMAIL, JFROG_TOKEN, and JFROG_ID environment variables must be set."
  exit 1
fi

echo "Connecting to SSH..."
ssh -o StrictHostKeyChecking=no "alpine@$ALPINE_IP" << EOF
  echo "$ALPINE_ROOT_PASSWORD" | su -c 'echo "
/media/vda/apks
http://dl-cdn.alpinelinux.org/alpine/v3.21/main
#http://dl-cdn.alpinelinux.org/alpine/v3.21/community
https://$JFROG_EMAIL:$JFROG_TOKEN@$JFROG_ID.jfrog.io/artifactory/alpine/v3.21/main
" > /etc/apk/repositories
  cat /etc/apk/repositories
  apk update'
EOF
