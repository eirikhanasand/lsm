#!/bin/bash

# Exits on error
set -e

# Checks if required environment variables are set
if [[ -z "$JFROG_EMAIL" || -z "$JFROG_TOKEN" || -z "$JFROG_ID" ]]; then
  echo "Error: JFROG_EMAIL, JFROG_TOKEN, and JFROG_ID environment variables must be set."
  exit 1
fi

# Install Bower (if not already installed)
if ! command -v bower &> /dev/null; then
  echo "Installing Bower..."
  npm install bower
fi

# Sets proxy environment variables
export http_proxy="https://$JFROG_ID.jfrog.io/artifactory/github/"
export https_proxy="https://$JFROG_ID.jfrog.io/artifactory/github/"

if [[ -f ".bowerrc" ]]; then
  rm .bowerrc
fi

# Creates Bower configuration file
cat > .bowerrc <<EOL
{
  "directory": "bower_components",
  "proxy": "$http_proxy",
  "https-proxy": "$https_proxy"
}
EOL

# Installs jquery to test the configuration
npx bower install jquery
