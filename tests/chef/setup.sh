#!/bin/bash

# Exit on error
set -e

# Check required environment variables
if [[ -z "$JFROG_EMAIL" || -z "$JFROG_TOKEN" || -z "$JFROG_ID" ]]; then
  echo "Error: JFROG_EMAIL, JFROG_TOKEN, and JFROG_ID environment variables must be set."
  exit 1
fi

# Install required Chef components
gem install knife-art

# Create necessary Chef directories
mkdir -p ~/.chef
mkdir -p cookbooks/test_download/recipes

# Configure Knife
cat <<EOF > ~/.chef/knife.rb
log_level                :info
log_location             STDOUT
node_name                'chef-client'
client_key               '~/.chef/client.pem'
chef_server_url          'https://lsm.jfrog.io/artifactory/api/chef/chef'
knife[:supermarket_site] = 'https://$JFROG_ID:$JFROG_TOKEN@lsm.jfrog.io/artifactory/api/chef/chef'
EOF

# DEBUG - Verify knife configuration
echo "Knife configuration:"
cat ~/.chef/knife.rb

# Fetch cookbook from Artifactory
knife supermarket install test_download

# DEBUG - List installed cookbooks
ls -R cookbooks

# Run Chef with downloaded cookbook
JFROG_ID=$JFROG_ID JFROG_EMAIL=$JFROG_EMAIL JFROG_TOKEN=$JFROG_TOKEN chef-client -z -o 'test_download::default'
