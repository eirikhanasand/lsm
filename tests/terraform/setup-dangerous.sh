#!/bin/bash

# Exits on error
set -e

# Checks if required environment variables are set
if [[ -z "$JFROG_EMAIL" || -z "$JFROG_TOKEN" || -z "$JFROG_ID" ]]; then
  echo "Error: JFROG_EMAIL, JFROG_TOKEN, and JFROG_ID environment variables must be set."
  exit 1
fi

# Creates the Terraform credentials file
mkdir -p .terraform.d
cat > .terraform.d/credentials.tfrc.json <<EOL
{
    "credentials": {
        "$JFROG_ID.jfrog.io": {
            "token": "$JFROG_TOKEN"
        }
    }
}
EOL

echo "UNIMPLEMENTED; NEEDS SEPERATE MAIN.TF FILE"
echo "UNIMPLEMENTED; NEEDS SEPERATE MAIN.TF FILE"
echo "UNIMPLEMENTED; NEEDS SEPERATE MAIN.TF FILE"
echo "UNIMPLEMENTED; NEEDS SEPERATE MAIN.TF FILE"
echo "UNIMPLEMENTED; NEEDS SEPERATE MAIN.TF FILE"

# Initializes
terraform init
