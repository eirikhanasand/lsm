#!/bin/sh

# THIS IS THE API ENTRYPOINT. SEE /ui/entrypoint.sh FOR THE FRONTEND ENTRYPOINT.

# Starts varnish
varnishd -a :8080 -f /etc/varnish/default.vcl -s malloc,512m &

# Starts API
npm start
