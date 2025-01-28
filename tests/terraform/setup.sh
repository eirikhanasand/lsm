#!/bin/bash

# Exits on error
set -e

# Checks if required environment variables are set
if [[ -z "$JFROG_EMAIL" || -z "$JFROG_TOKEN" || -z "$JFROG_ID" ]]; then
  echo "Error: JFROG_EMAIL, JFROG_TOKEN, and JFROG_ID environment variables must be set."
  exit 1
fi

# Creates the Terraform credentials file
# mkdir -p ~/.terraform.d
# cat > ~/.terraform.d/credentials.tfrc.json <<EOL
# {
#     "credentials": {
#         "$JFROG_ID.jfrog.io": {
#             "token": "$JFROG_TOKEN"
#         }
#     }
# }
# EOL

# 
rm -rf .terraform

# Creates the Terraform RC file for provider installation
cat > .terraformrc <<EOL
provider_installation {
    network_mirror {
        url = "https://$JFROG_ID.jfrog.io/artifactory/api/terraform/providers/"
    }
    direct {
        exclude = ["registry.terraform.io/*/*"]
    }
}
EOL

chmod 644 .terraformrc
rm -rf .terraform
rm -rf ~/.terraform.d/plugin-cache
export TF_CLI_CONFIG_FILE=$(pwd)/.terraformrc
# terraform providers

# Initializes Terraform
# terraform init
terraform init


# Validates the config
terraform validate
