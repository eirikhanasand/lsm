#!/bin/bash

# Exits on error
set -e

# Checks if required environment variables are set
if [[ -z "$JFROG_EMAIL" || -z "$JFROG_TOKEN" || -z "$JFROG_ID" ]]; then
  echo "Error: JFROG_EMAIL, JFROG_TOKEN, and JFROG_ID environment variables must be set."
  exit 1
fi

# Installs Bower
if ! command -v bower &> /dev/null; then
  echo "Installing Bower..."
  npm install bower
fi




# THIS SECTION CAN LIKELY BE REMOVED WHEN THE CONFIGURATION IS WORKING
# Creates a Bower configuration file
cat > .bowerrc <<EOL
{
  "directory": "bower_components",
  "proxy": "https://$TRIAL_ID.jfrog.io/artifactory/github/",
  "https-proxy": "https://$TRIAL_ID.jfrog.io/artifactory/github/"
}
EOL

# Initializes the Bower project
npx bower init --yes
# THIS SECTION CAN LIKELY BE REMOVED WHEN THE CONFIGURATION IS WORKING




# Installs jquery to test the configuration
npx bower install jquery
