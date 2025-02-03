remote_file '/tmp/README.md' do
    source "https://#{ENV['JFROG_EMAIL']}:#{ENV['JFROG_TOKEN']}@#{ENV['JFROG_ID']}.jfrog.io/artifactory/github/eirikhanasand/lsm/blob/main/README.md"
    action :create
end
