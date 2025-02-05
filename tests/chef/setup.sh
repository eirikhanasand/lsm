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
#touch cookbooks/test_download/recipes/default.rb

# Add basic content to default.rb
cat <<EOF > cookbooks/test_download/recipes/default.rb
log 'Hello, Chef!' do
  level :info
end
EOF

# Add metadata.rb to define the cookbook
cat <<EOF > cookbooks/test_download/metadata.rb
name 'test_download'
version '0.1.0'
EOF

# DEBUG
echo "Current Directory: $(pwd)"
ls -R cookbooks

# Runs the Chef client with the test_download cookbook
JFROG_ID=$JFROG_ID JFROG_EMAIL=$JFROG_EMAIL JFROG_TOKEN=$JFROG_TOKEN chef-client -z -c solo.rb -o 'test_download::default'
