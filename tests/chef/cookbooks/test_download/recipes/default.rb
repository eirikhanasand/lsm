remote_file '/tmp/test_file' do
    source 'https://raw.githubusercontent.com/github/gitignore/main/README.md'
    action :create
end
