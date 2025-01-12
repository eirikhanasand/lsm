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

## How to log into different technologies
<!-- docker login (remember to create access token) -->
docker login trial9apndc.jfrog.io

<!-- npm login -->
npm login --registry=https://trial9apndc.jfrog.io/artifactory/api/npm/npm/ --auth-type=web

## How to fetch package via Artifactory
<!-- docker download "exposures" (sample) image -->
docker pull trial9apndc.jfrog.io/docker-trial/exposures:latest

<!-- npm download -->
npm install <dependency_name> --registry https://trial9apndc.jfrog.io/artifactory/api/npm/npm/   

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
