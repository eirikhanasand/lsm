#!/bin/bash

# Exits on error
set -e

# Checks if required environment variables are set
if [[ -z "$JFROG_EMAIL" || -z "$JFROG_TOKEN" || -z "$JFROG_ID" ]]; then
  echo "Error: JFROG_EMAIL, JFROG_TOKEN, and JFROG_ID environment variables must be set."
  exit 1
fi

cat > ansible.cfg <<EOL
[galaxy]
server_list = artifactory_collections
[galaxy_server.artifactory_collections]
url = https://{{ jfrog_id }}.jfrog.io/artifactory/api/ansible/collections/
EOL

cat > inventory.ini <<EOL
[localhost]
127.0.0.1 ansible_connection=local
EOL

cat > test_proxy.yml <<EOL
---
- name: Test Artifactory Proxy
  hosts: localhost
  tasks:
    - name: Download a file via Artifactory proxy
      ansible.builtin.get_url:
        url: "https://{{ JFROG_EMAIL }}:{{ JFROG_TOKEN }}@{{ JFROG_ID }}.jfrog.io/artifactory/github/eirikhanasand/lsm/blob/main/README.md"
        dest: ./README.md
EOL

# Runs the playbook with proxy settings
ansible-playbook -i inventory.ini test_proxy.yml -e "JFROG_ID=$JFROG_ID" -e "JFROG_EMAIL=$JFROG_EMAIL" -e "JFROG_TOKEN=$JFROG_TOKEN" 2>&1 | tee ansible.log || {
  if grep -q "409" ansible.log; then
    echo "409 success"
  else
    exit 1
  fi
}

rm inventory.ini ansible.cfg ansible.log test_proxy.yml
