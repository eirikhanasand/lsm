#!/bin/bash

# Exits on error
set -e

# Checks if required environment variables are set
if [[ -z "$JFROG_EMAIL" || -z "$JFROG_TOKEN" || -z "$JFROG_ID" ]]; then
  echo "Error: JFROG_EMAIL, JFROG_TOKEN, and JFROG_ID environment variables must be set."
  exit 1
fi

# Runs the playbook with proxy settings
ansible-playbook -i inventory.ini test_proxy.yml -e "JFROG_ID=$JFROG_ID" -e "JFROG_EMAIL=$JFROG_EMAIL" -e "JFROG_TOKEN=$JFROG_TOKEN"
