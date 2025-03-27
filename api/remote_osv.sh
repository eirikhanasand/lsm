#!/bin/bash

echo "Using remote database."
HEALTH_FILE="/tmp/health_status"
echo "starting" > $HEALTH_FILE
sleep 10
echo "healthy" > $HEALTH_FILE
