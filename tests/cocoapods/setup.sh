#!/bin/bash

# Exits on error
set -e

# Checks if required environment variables are set
if [[ -z "$JFROG_EMAIL" || -z "$JFROG_TOKEN" || -z "$JFROG_ID" ]]; then
  echo "Error: JFROG_EMAIL, JFROG_TOKEN, and JFROG_ID environment variables must be set."
  exit 1
fi

# Set up proxy environment variables
export http_proxy="http://your-proxy-address:port"
export https_proxy="http://your-proxy-address:port"

# Create a directory for the CocoaPods test
mkdir -p cocoapods_test
cd cocoapods_test

# Initialize a new Podfile
cat > Podfile <<EOL
platform :ios, '12.0'

target 'TestApp' do
  use_frameworks!
  pod 'AFNetworking', '~> 4.0'
end
EOL

# Install CocoaPods if it's not installed
if ! command -v pod &> /dev/null; then
  echo "Installing CocoaPods..."
  gem install cocoapods
fi

# Install the pod dependencies (with the proxy)
echo "Installing pods with proxy..."
pod install

# Verify if the pods were installed
if [[ -d "Pods/AFNetworking" ]]; then
  echo "CocoaPod 'AFNetworking' installed successfully."
else
  echo "Failed to install CocoaPod 'AFNetworking'."
fi
