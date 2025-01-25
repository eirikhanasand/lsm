#!/bin/sh

# THIS IS THE FRONTEND ENTRYPOINT. SEE /api/entrypoint.sh FOR THE API ENTRYPOINT.

# Starts varnish
varnishd -a :3000 -f /etc/varnish/default.vcl -s malloc,512m &

# Starts API
npm start
