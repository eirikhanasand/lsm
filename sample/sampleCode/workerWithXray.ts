
// THIS FILE IS NOT COMPLETE, ITS JUST A SNIPPET THAT INCLUDES THE XRAY EXAMPLE

// import { PlatformContext, BeforeDownloadRequest, DownloadStatus } from 'jfrog-workers'
// import { BeforeDownload } from '../../src/interfaces.js'
// import { GoogleStatus } from '../../src/types.js'

// const OSV_URL = "https://api.osv.dev/v1/query"
// const parseNameToNameAndVersion = /^([a-zA-Z0-9-]+)-([\d\.]+)\.tgz$/

// export default async function runWorker(context: PlatformContext, data: BeforeDownloadRequest): Promise<BeforeDownload> {
//     const MAX_CRITICAL_SEC_ISSUES_ACCEPTED = 2

//     console.log(typeof data)
//     console.log("Data", data)
//     console.log(JSON.stringify(data))

//     const nameAndVersion = data.metadata.name.match(parseNameToNameAndVersion)
//     if (nameAndVersion) {
//         console.log({
//             name: nameAndVersion[1],
//             version: nameAndVersion[2]
//         })
//     } else {
//         return {
//             status: DownloadStatus.DOWNLOAD_STOP,
//             message: `Unable to extract name and version.`,
//             // @ts-ignore, doesnt exist locally but does exist remotely
//             headers: {}
//         }
//     }

//     const googleStatus = await checkHash(context, "", "", "")

//     if (googleStatus.status === 200) {
//         return {
//             status: DownloadStatus.DOWNLOAD_PROCEED,
//             message: `Google is up: proceed with the download.`,
//             // @ts-ignore - Required field, doesnt exist locally but does exist remotely
//             headers: {}
//         }
//     } else {
//         console.log({googleStatus})
//         return {
//             status: DownloadStatus.DOWNLOAD_STOP,
//             message: `Google is down: proceed with the download.`,
//             // @ts-ignore - Required field, doesnt exist locally but does exist remotely
//             headers: {}
//         }
//     }

//     const isXrayAvailable = await checkIfXrayAvailable()
//     if (!isXrayAvailable) {
//         return {
//             status: DownloadStatus.DOWNLOAD_WARN,
//             message: "Could not check for xray scans because xray is not available. Proceeding download with warning.",
//             // @ts-ignore
//             // This can be populated if response headers are required to be added/overriden. 
//             headers: {}
//         }
//     }

//     let status: DownloadStatus = DownloadStatus.DOWNLOAD_UNSPECIFIED
//     let message = ''

//     let responseData: {
//         "data": [
//             {
//                 "name": string,
//                 "repo_path": string,
//                 "package_id": string,
//                 "version": string,
//                 "sec_issues": {
//                     "critical": number,
//                     "high": number,
//                     "low": number,
//                     "medium": number,
//                     "total": number
//                 },
//                 "size": string,
//                 "violations": number,
//                 "created": string,
//                 "deployed_by": string,
//                 "repo_full_path": string
//             }
//         ],
//         "offset": number
//     } = null

//     try {
//         const artifactName = data.metadata.repoPath.path.substr(data.metadata.repoPath.path.lastIndexOf('/') + 1)
//         const repoKey = data.metadata.repoPath.key

//         const res = await context.clients.platformHttp.get(`/xray/api/v1/artifacts?repo=${repoKey}&search=${artifactName}&num_of_rows=1`)
//         responseData = res.data

//         if (res.status === 200) {
//             const critialIssues: number = Array.isArray(responseData?.data) && responseData.data[0].sec_issues?.critical || 0
//             if (critialIssues < MAX_CRITICAL_SEC_ISSUES_ACCEPTED) {
//                 message = `Artifact has less than ${MAX_CRITICAL_SEC_ISSUES_ACCEPTED} security issues: proceed with the download.`
//                 status = DownloadStatus.DOWNLOAD_PROCEED
//             } else {
//                 message = `DOWNLOAD STOPPED : artifact scan shows ${critialIssues} critical security issues.`
//                 status = DownloadStatus.DOWNLOAD_STOP
//             }
//         } else {
//             status = DownloadStatus.DOWNLOAD_WARN
//             message = 'Request returned unexpected result. Download will proceed with warning.'
//         }
//     } catch (error) {
//         message = "Error during scan check. Download will proceed with warning."
//         status = DownloadStatus.DOWNLOAD_WARN
//         console.error(`Request failed: ${error.message}`)
//     }

//     return {
//         status,
//         message,
//         // @ts-ignore
//         // This can be populated if response headers are required to be added/overriden.
//         headers: {}
//     }


//     async function checkIfXrayAvailable(): Promise<boolean> {
//         try {
//             const response = await context.clients.platformHttp.get('/xray/api/v1/system/ping')
//             if (response.data.status !== "pong") {
//                 throw new Error("Xray not available")
//             }
//             return true
//         } catch (error) {
//             console.log(`Encountered error ${error.message} while checking for xray readiness. Allowing download with a warning`)
//             return false
//         }

//     }
// }

// async function checkHash(context: PlatformContext, name: string, version: string, ecosystem: string): Promise<GoogleStatus> {
//     // safe version
//     // react 19.0.0

//     // vulnerable version (DO NOT INSTALL, THIS IS DIRECT MALWARE THAT INFECTS YOUR PC)
//     // solana-stable-web-huks 4.0.0

//     try {
//         const response = await context.clients.axios.post(
//             OSV_URL, 
//             {
//                 version, 
//                 package: {
//                     name,
//                     ecosystem
//                 }
//             },
//             {
//                 headers: {
//                     'Content-Type': 'application/json'
//                 }
//             }
//         )

//         return {
//             status: 200,
//             data: response.data
//         }
//     } catch (error) {
//         if (error.response) {
//             return {
//                 status: 500,
//                 data: error.response.data
//             }
//         } else {
//             return {
//                 status: 500,
//                 data: error.message
//             }
//         }
//     }
// }
