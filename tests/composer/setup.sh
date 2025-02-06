#!/bin/bash

# Exits on error
set -e

# Checks if required environment variables are set
if [[ -z "$JFROG_EMAIL" || -z "$JFROG_TOKEN" || -z "$JFROG_ID" ]]; then
  echo "Error: JFROG_EMAIL, JFROG_TOKEN, and JFROG_ID environment variables must be set."
  exit 1
fi

if [[ -f ".composer/auth.json" ]]; then
  rm .composer/auth.json
fi

if [[ -f ".composer/config.json" ]]; then
  rm .composer/config.json
fi

# Composer Auth
cat > .composer/auth.json <<EOL
{
    "http-basic": {
        "$JFROG_ID.jfrog.io": {
            "username": "$JFROG_USERNAME",
            "password": "$JFROG_TOKEN"
        }
    }
}

EOL

# Composer Config
cat > .composer/config.json <<EOL
{
    "repositories": [
        {"type": "composer", "url": "https://$JFROG_ID.jfrog.io/artifactory/api/composer/composer"},
        {"packagist": false}
    ]
}


EOL

brew install php

php -r "copy('https://getcomposer.org/installer', 'composer-setup.php');"
php composer-setup.php
php -r "unlink('composer-setup.php');"

sudo mv composer.phar /usr/local/bin/composer
chmod +x /usr/local/bin/composer

# Installs composer.json dependencies to test the configuration
composer install --prefer-dist
