#!/bin/bash

# Exits on error
set -e

# Checks if required environment variables are set
if [[ -z "$JFROG_EMAIL" || -z "$JFROG_TOKEN" || -z "$JFROG_ID" ]]; then
  echo "Error: JFROG_EMAIL, JFROG_TOKEN, and JFROG_ID environment variables must be set."
  exit 1
fi

# Set up proxy environment variables
export http_proxy="https://$JFROG_ID.jfrog.io/artifactory/github/"
export https_proxy="https://$JFROG_ID.jfrog.io/artifactory/github/"

# Create a directory for the CocoaPods test
mkdir -p cocoapods_test
cd cocoapods_test

# Installs xcodeproj
gem install xcodeproj

# Ruby script to create a xcodeproj file
ruby create_xcodeproj.rb

# Initializes new Podfile
cat > Podfile <<EOL
platform :ios, '12.0'

target 'TestApp' do
  use_frameworks!
  pod 'AFNetworking', '~> 4.0'
end
EOL

# Installs CocoaPods if it's not installed
if ! command -v pod &> /dev/null; then
  echo "Installing CocoaPods..."
  gem install cocoapods
fi

# Installs the pod dependencies to test if the proxy works
pod install
