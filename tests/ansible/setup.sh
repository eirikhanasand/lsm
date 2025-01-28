#!/bin/bash

# Exits on error
set -e

# Checks if required environment variables are set
if [[ -z "$JFROG_EMAIL" || -z "$JFROG_TOKEN" || -z "$JFROG_ID" ]]; then
  echo "Error: JFROG_EMAIL, JFROG_TOKEN, and JFROG_ID environment variables must be set."
  exit 1
fi

# Exports proxy environment variables
export http_proxy="https://$TRIAL_ID.jfrog.io/artifactory/github/"
export https_proxy="https://$TRIAL_ID.jfrog.io/artifactory/github/"

# Runs the playbook
ansible-playbook -i inventory.ini test_proxy.yml

# Verifies if the file was downloaded
if [[ -f "/tmp/test_file.png" ]]; then
  echo "File downloaded successfully via proxy."
else
  echo "Failed to download the file."
fi
