#!/bin/bash

# Exits on error
set -e

# Checks if required environment variables are set
if [[ -z "$JFROG_EMAIL" || -z "$JFROG_TOKEN" || -z "$JFROG_ID" ]]; then
  echo "Error: JFROG_EMAIL, JFROG_TOKEN, and JFROG_ID environment variables must be set."
  exit 1
fi

# Writes the auth token directly to .npmrc
echo "//${JFROG_ID}.jfrog.io/artifactory/api/npm/npm/:_authToken=${JFROG_TOKEN}" >> ~/.npmrc

# Sets the JFrog registry as the default
npm config set registry https://${JFROG_ID}.jfrog.io/artifactory/api/npm/npm/

# Installs the package
npm install mathlive@0.103.0

# Resets the registry to the default NPM registry
npm config set registry https://registry.npmjs.org/

# Removes the token from .npmrc after the script
sed -i '' "/${JFROG_ID}.jfrog.io/d" ~/.npmrc
