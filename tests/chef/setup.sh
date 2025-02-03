#!/bin/bash

# Exits on error
set -e

# Checks if required environment variables are set
if [[ -z "$JFROG_EMAIL" || -z "$JFROG_TOKEN" || -z "$JFROG_ID" ]]; then
  echo "Error: JFROG_EMAIL, JFROG_TOKEN, and JFROG_ID environment variables must be set."
  exit 1
fi

# Creates necessary chef directories and files
mkdir -p cookbooks/test_download/recipes
touch cookbooks/test_download/recipes/default.rb

# Sets proxy environment variables
export http_proxy="https://$JFROG_EMAIL:$JFROG_TOKEN@$JFROG_ID.jfrog.io/artifactory/github/"
export https_proxy="https://$JFROG_EMAIL:$JFROG_TOKEN@$JFROG_ID.jfrog.io/artifactory/github/"

# Runs the Chef client with the test_download cookbook
JFROG_ID=$JFROG_ID JFROG_EMAIL=$JFROG_EMAIL JFROG_TOKEN=$JFROG_TOKEN chef-client -z -c solo.rb -o 'test_download::default'
