#!/bin/bash

# Exits on error
set -e

# Checks if required environment variables are set
if [[ -z "$JFROG_EMAIL" || -z "$JFROG_TOKEN" || -z "$JFROG_ID" || -z "$DEBIAN_IP" ]]; then
  echo "Error: DEBIAN_IP, JFROG_EMAIL, JFROG_TOKEN, and JFROG_ID environment variables must be set."
  exit 1
fi

echo "Connecting to SSH..."
ssh -o StrictHostKeyChecking=no "debian@$DEBIAN_IP" << EOF

  sudo apt update

EOF
