# lsm
Library Safety Manager Open Source Plugin For Artifactory

## How to use the worker
1. Make sure the worker is active (it autodisables itself every time you push an update, see the "How to activate an Artifactory Worker" section) 
2. Create repository or find artifact
3. Use the technology to fetch the package (see the "How to fetch package via Artifactory" section)

## How to create Artifactory Repository
1. In the Artifactory platform, select Administration 
-> Repositories (left hand side menu) 
-> Create a repository (green button, right side) 
-> Local for private npm packages you made, Remote for public like React or something you didnt make.
-> Select the package manager (usually docker or npm or whatever matches the technology you are using)
-> Set repository key to whatever you want to name the repository (usually the project name). Leave all other fields empty if you dont know what to put there. Make sure not to touch the URL field unless you know its incorrect and know what to put there.
-> Create (remote / local) repository (button with green stroke bottom right)

## How to develop the worker
1. Run `npm install` to install all development dependencies
2. Create a `.env` file in the `src` directory
3. Add the following credentials to the `.env` file:
```ts
JFROG_USERNAME=<your_jfrog_username>
JFROG_ACCESS_TOKEN=<your_jfrog_token>
JFROG_TRIAL_ID=<your_jfrog_trial_id>
```

## How to log into different technologies
<!-- docker login (remember to create access token) -->
docker login <trial_id>.jfrog.io

<!-- npm login -->
npm login --registry=https://<trial_id>.jfrog.io/artifactory/api/npm/npm/ --auth-type=web

## How to fetch package via Artifactory
<!-- docker download "exposures" (sample) image -->
docker pull <trial_id>.jfrog.io/docker-trial/exposures:latest

<!-- npm download -->
npm install <dependency_name> --registry https://<trial_id>.jfrog.io/artifactory/api/npm/npm/   

## How to activate an Artifactory Worker
1. Ensure the worker is deployed (check that the code matches the remote if you are unsure)
2. In the Artifactory platform, select Administration 
3. Click Workers (left side menu at the very bottom)
4. Find the worker in question
5. Ensure "Enable" is toggled on
6. Click the three dots at the right side of the worker
7. Click "Edit"
8. Ensure that it still says "Enabled" on the right side besides the gear icon
9. Click the gear icon
10. Click on the pencil in the "Repositories" box to edit the repositories filter
11. Click on the green double right arrow icon (>>)
12. Ensure all repositories are now active for the filter
13. Click ok to save the filter
14. Click ok again to save the updated worker settings
15. Click "Save" to save the worker changes

## Debugging the worker
1. Ensure the worker is active and that the events are up to date (check the metadata)
2. You have to use a new package, previous packages are cached and will not be refetched even if you update the worker.

## How to use Artifactory
The worker functions with the following package managers / technologies:
- docker
- gradle
- maven
- npm
- pip
- ruby
- huggingface (via pip)

We are currently working on:
- go
- rust
- terraform
- 

### docker
-- todo

### npm
1. Login with `npm login <id>.jfrog.io`
-- todo

### terraform
NB: Remember to replace the ID both in the login command and configuration file.
1. Login with `terraform login <id>.jfrog.io`
2. Add a configuration file `.terraformrc` with the following configuration:
```tf
provider_installation {
    direct {
        exclude = ["registry.terraform.io/*/*"]
    }
    network_mirror {
        url = "https://<id>.jfrog.io/artifactory/api/terraform/terraform/providers/"
    }
}
```
3. Run `terraform init`
-- todo

### ruby
1. Add it to the `~/.gemrc` file using the following command:
`gem source -a https://<username>:<token>@trial9apndc.jfrog.io/artifactory/api/gems/ruby/`
2. If anonymous access is allowed `gem source -a https://<id>.jfrog.io/artifactory/api/gems/ruby/` can be used.
3. To view a list of sources and their resolutions use `gem source --list`.
4. To store the credential in `~/.gem/credentials` use `curl -u <email>%40<email_domain>:<token> https://<id>.jfrog.io/artifactory/api/gems/ruby/api/v1/api_key.yaml > ~/.gem/credentials`
5. `gem install <PACKAGE>` or explicitly `gem install <PACKAGE> --source https://trial9apndc.jfrog.io/artifactory/api/gems/ruby`

### NuGet
#### Add Artifactory as a NuGet Source:  
`nuget sources Add -Name ArtifactoryNuGet -Source https://trial9apndc.jfrog.io/artifactory/nuget-nuget-remote`  
`nuget setapikey <YOUR_EMAIL>:<YOUR_API_KEY> -Source Artifactory`  

#### Steps to Configure Artifactory as a NuGet Source  
1. Log in to your Artifactory Instance  
2. Navigate to Admin > Repositories > Repositories.  
3. Create or identify your NuGet Remote Repository.  
- Example URL: `https://api.nuget.org/v3/index.json` (for nuget.org).  

#### Update Your nuget.config  
Create or modify the nuget.config file to include your Artifactory repository.  
File Locations:  
Windows: %AppData%\NuGet\nuget.config  
Linux/Mac: ~/.config/NuGet/Nuget.Config  
Example nuget.config File:
```xml
<configuration>
  <packageSources>
    <add key="Artifactory" value="https://your-artifactory-instance.jfrog.io/artifactory/nuget-remote" />
  </packageSources>
  <apikeys>
    <add key="https://your-artifactory-instance.jfrog.io/artifactory/nuget-remote" value="YOUR_API_KEY" />
  </apikeys>
</configuration>
```
#### Install Packages using Artifactory

nuget install AutoMapper -Source Artifactory