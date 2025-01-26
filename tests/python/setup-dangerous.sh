#!/bin/bash

# Exits on error
set -e

# Checks if required environment variables are set
if [[ -z "$JFROG_EMAIL" || -z "$JFROG_TOKEN" || -z "$JFROG_ID" ]]; then
  echo "Error: JFROG_EMAIL, JFROG_TOKEN, and JFROG_ID environment variables must be set."
  exit 1
fi

# Removes existing virtual environment, if any
rm -rf pvenv

# Creates a new virtual environment
python3 -m venv pvenv

# Creates the pip.conf file within the virtual environment
cat > pvenv/pip.conf <<EOL
[global]
index-url = https://$JFROG_EMAIL:$JFROG_TOKEN@$JFROG_ID.jfrog.io/artifactory/api/pypi/python/simple
EOL

# Activates the virtual environment
source pvenv/bin/activate

# Installs numpy without using cache
python3 -m pip install strawberry-graphql==0.182.0 --no-cache-dir
