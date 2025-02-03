#!/bin/bash

# Exits on error
set -e

# Checks if required environment variables are set
if [[ -z "$JFROG_EMAIL" || -z "$JFROG_TOKEN" || -z "$JFROG_ID" ]]; then
  echo "Error: JFROG_EMAIL, JFROG_TOKEN, and JFROG_ID environment variables must be set."
  exit 1
fi

# Installs Bower (if not already installed)
if ! command -v bower &> /dev/null; then
  echo "Installing Bower, Bower Art Resolver..."
  npm install bower bower-art-resolver
fi

if [[ -f ".bowerrc" ]]; then
  rm .bowerrc
fi

# Bower configuration file
cat > .bowerrc <<EOL
{
	"registry" : "https://$JFROG_EMAIL:$JFROG_TOKEN@$JFROG_ID.jfrog.io/artifactory/api/bower/bower",
	"resolvers" : [
		"bower-art-resolver"
	]
}
EOL

# Installs jquery to test the configuration
npx bower install jquery
