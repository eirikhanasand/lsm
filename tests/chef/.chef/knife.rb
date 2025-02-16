log_level                :info
log_location             STDOUT
node_name                'chef-client'
client_key               '~/.chef/client.pem'
chef_server_url          'https://lsm.jfrog.io/artifactory/api/chef/chef'
knife[:supermarket_site] = 'https://$JFROG_ID:$JFROG_TOKEN@lsm.jfrog.io/artifactory/api/chef/chef'

cookbook_path ["#{File.expand_path(File.dirname(__FILE__))}/../cookbooks"]
