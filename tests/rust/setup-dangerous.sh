#!/bin/bash

# Exits on error
set -e

# Checks if required environment variables are set
if [[ -z "$JFROG_EMAIL" || -z "$JFROG_TOKEN" || -z "$JFROG_ID" ]]; then
  echo "Error: JFROG_EMAIL, JFROG_TOKEN, and JFROG_ID environment variables must be set."
  exit 1
fi

echo "Bearer $JFROG_TOKEN" | cargo login
CARGO_REGISTRIES_DEFAULT=https://$JFROG_ID.jfrog.io/artifactory/api/cargo/cargo-remote 
cargo add serde-json-wasm@1.0.0