#!/bin/bash

# Exit on error
set -e

# Check if required environment variables are set
if [[ -z "$JFROG_EMAIL" || -z "$JFROG_TOKEN" || -z "$JFROG_ID" ]]; then
  echo "Error: JFROG_EMAIL, JFROG_TOKEN, and JFROG_ID environment variables must be set."
  exit 1
fi

# Remove existing virtual environment, if any
rm -rf pvenv

# Create a new virtual environment
python3 -m venv pvenv

# Activate the virtual environment
source pvenv/bin/activate

# Create the pip.conf file within the virtual environment
cat > pvenv/pip.conf <<EOL
[global]
index-url = https://$JFROG_EMAIL:$JFROG_TOKEN@$JFROG_ID.jfrog.io/artifactory/api/pypi/python/simple
EOL
