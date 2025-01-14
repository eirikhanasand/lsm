import { PlatformContext, BeforeDownloadRequest, DownloadStatus } from 'jfrog-workers'
import { BeforeDownload } from './interfaces.js';
// LAST IMPORT MUST HAVE SEMICOLON, OTHERWISE JFROG ARTIFACTORY PARSING FAILS

const OSV_URL = "https://api.osv.dev/v1/query"
const parseNameToNameAndVersion = /^([a-zA-Z0-9-]+)-([\d\.]+)\.tgz$/

export default async function runWorker(context: PlatformContext, data: BeforeDownloadRequest): Promise<BeforeDownload> {
    const NPMtestData = {
        "repoPath": {
          "key": "npm",
          "path": "@types/estree/-/estree-1.0.6.tgz",
          "id": "npm:@types/estree/-/estree-1.0.6.tgz"
        },
        "originalRepoPath": {
          "key": "npm",
          "path": "@types/estree/-/estree-1.0.6.tgz",
          "id": "npm:@types/estree/-/estree-1.0.6.tgz"
        },
        "name": "estree-1.0.6.tgz",
        "servletContextUrl": "https://trial9apndc.jfrog.io/artifactory",
        "uri": "/artifactory/npm/@types/estree/-/estree-1.0.6.tgz",
        "clientAddress": "18.214.241.149",
        "repoType": 2
    }

    const DOCKERtestData = {
       "repoPath": {
          "key": "docker",
          "path": "library/ubuntu/latest/list.manifest.json",
          "id": "docker:library/ubuntu/latest/list.manifest.json"
        },
        "originalRepoPath": {
          "key": "docker",
          "path": "library/ubuntu/latest/list.manifest.json",
          "id": "docker:library/ubuntu/latest/list.manifest.json"
        },
        "name": "list.manifest.json",
        "ifModifiedSince": -1,
        "clientAddress": "88.95.182.216",
        "repoType": 2
    }

    const PYTHONtestData = {
        "repoPath": {
          "key": "python",
          "path": "c0/2a/fb0a27f846cb857cef0c4c92bef89f133a3a1abb4e16bba1c4dace2e9b49/numpy-2.2.1-cp313-cp313-macosx_14_0_arm64.whl",
          "id": "python:c0/2a/fb0a27f846cb857cef0c4c92bef89f133a3a1abb4e16bba1c4dace2e9b49/numpy-2.2.1-cp313-cp313-macosx_14_0_arm64.whl"
        },
        "originalRepoPath": {
          "key": "python",
          "path": "c0/2a/fb0a27f846cb857cef0c4c92bef89f133a3a1abb4e16bba1c4dace2e9b49/numpy-2.2.1-cp313-cp313-macosx_14_0_arm64.whl",
          "id": "python:c0/2a/fb0a27f846cb857cef0c4c92bef89f133a3a1abb4e16bba1c4dace2e9b49/numpy-2.2.1-cp313-cp313-macosx_14_0_arm64.whl"
        },
        "name": "numpy-2.2.1-cp313-cp313-macosx_14_0_arm64.whl",
        "ifModifiedSince": -1,
        "clientAddress": "88.95.182.216",
        "repoType": 2
    }

    const GOtestData = {
        "repoPath": {
          "key": "go",
          "path": "github.com/mattermost/mattermost/@v/v10.3.1.info",
          "id": "go:github.com/mattermost/mattermost/@v/v10.3.1.info"
        },
        "originalRepoPath": {
          "key": "go",
          "path": "github.com/mattermost/mattermost/@v/v10.3.1.info",
          "id": "go:github.com/mattermost/mattermost/@v/v10.3.1.info"
        },
        "name": "v10.3.1.info",
        "ifModifiedSince": -1,
        "clientAddress": "81.167.47.252",
        "replaceHeadRequestWithGet": true,
        "repoType": 2
    }

    // const metadata = NPMtestData
    // const metadata = DOCKERtestData
    // const metadata = PYTHONtestData
    // const metadata = GOtestData
    const metadata = data.metadata
    let name: string | null = null
    let version: string | null = null
    let key: string = parseKey(metadata.repoPath.key)
    
    switch (metadata.repoPath.key) {
        case "npm": 
            const npmDetails = metadata.name.match(parseNameToNameAndVersion)
            name = npmDetails[1]
            version = npmDetails[2]
            break
        case "docker":
            const dockerDetails = metadata.repoPath.path.split('/')
            name = dockerDetails[1]
            version = dockerDetails[2]
            key = dockerDetails[1].includes('ubuntu') ? 'Ubuntu' : 'Debian'
            break
    }

    if (!name || !version) {
        console.log(`DOWNLOAD STOPPED: UNABLE TO EXTRACT NAME AND VERSION - ${metadata.name}`)
        return {
            status: DownloadStatus.DOWNLOAD_STOP,
            message: `DOWNLOAD STOPPED - Unable to extract package name and version.`,
            // @ts-ignore, doesnt exist locally but does exist remotely
            headers: {}
        }
    }

    const hashData = await checkHash(context, name, version, key)
    if (hashData.status !== 200) {
        prettyLog(['DOWNLOAD STOPPED: UNABLE TO FETCH', `Name: ${name}`, `Version: ${version}`, `Key: ${key}`])
        console.log(hashData)
        return {
            status: DownloadStatus.DOWNLOAD_STOP,
            message: `DOWNLOAD STOPPED - Unable to fetch package info from OSV.`,
            // @ts-ignore - Required field, doesnt exist locally but does exist remotely
            headers: {}
        }
    }

    if ('vulns' in hashData.data) {
        // TITLE SECTION
        prettyLog(['DOWNLOAD STOPPED: MALICIOUS', `Name: ${name}`, `Version: ${version}`, `Key: ${key}`])
        console.log('-----------------------------');
        for (const vulnerability of hashData.data.vulns) {
            logDetails(vulnerability)
        }
        return {
            status: DownloadStatus.DOWNLOAD_STOP,
            message: `DOWNLOAD STOPPED: Malicious package detected.`,
            // @ts-ignore - Required field, doesnt exist locally but does exist remotely
            headers: {}
        }
    }

    prettyLog(['DOWNLOAD CONTINUED', `Name: ${name}`, `Version: ${version}`, `Key: ${key}`])
    
    if (JSON.stringify(hashData.data) !== '{}') {
        console.log(hashData.data)
    }
    
    return {
        status: DownloadStatus.DOWNLOAD_STOP,
        // status: DownloadStatus.DOWNLOAD_PROCEED,
        message: `DOWNLOAD CONTINUED: proceed with the download.`,
        // @ts-ignore - Required field, doesnt exist locally but does exist remotely
        headers: {}
    }
}

async function checkHash(context: PlatformContext, name: string, version: string, ecosystem: string): Promise<GoogleStatus> {
    try {
        const response = await context.clients.axios.post(
            OSV_URL, 
            {
                version, 
                package: {
                    name,
                    ecosystem
                }
            },
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        )

        return {
            status: 200,
            data: response.data
        }
    } catch (error) {
        if (error.response) {
            return {
                status: 500,
                data: error.response.data
            }
        } else {
            return {
                status: 500,
                data: error.message
            }
        }
    }
}

function parseKey(key: string): string {
    if (key.includes('-')) {
        return key.split('-')[0]
    }

    if (key.includes('_')) {
        return key.split('_')[0]
    }
    
    return key
}

function prettyLog(logs: any[]): void {
    for (const log of logs) {
        console.log(log)
    }
}

function logDetails(vulnerability: Vulnerability): void {
    // FIRST INFO SECTION
    prettyLog([
        `${vulnerability.id} - ${vulnerability.summary}`,
        `Published ${formatDate(vulnerability.published)}`,
        `Modified ${formatDate(vulnerability.modified)}`,
        ...vulnerability.details.split('\n')
    ])

    if (vulnerability.aliases && vulnerability.aliases.length) {
        prettyLog(["Aliases", ...vulnerability.aliases])
    }

    // VERSIONS SECTION
    if ('affected' in vulnerability && Array.isArray(vulnerability.affected)) {
        console.log('-----------------------------');
        console.log("Affected versions:")
        for (const affected of vulnerability.affected) {
            if ('versions' in affected && Array.isArray(affected.versions)) {
                console.log(affected.versions.join(', '))
            }
        }
    }

    // SPECIFICS SECTION
    console.log('-----------------------------');
    console.log("Specifics")
    for (const detail of vulnerability.database_specific["malicious-packages-origins"]) {
        prettyLog([
            `SHA256: ${detail.sha256}`,
            `Import time ${formatDate(detail.import_time)}`,
            `Modified time ${formatDate(detail.modified_time)}`,
            `Source: ${detail.source}`
        ])
    }

    if (vulnerability.references) {
        prettyLog(["References", ...vulnerability.references])
    }
}

function formatDate(date: string): string {
    const parsedDate = new Date(date)
    const day = parsedDate.getDate().toLocaleString().padStart(2, '0')
    const month = (parsedDate.getMonth() + 1).toLocaleString().padStart(2, '0')
    const year = parsedDate.getFullYear()
    const hour = parsedDate.getHours().toLocaleString().padStart(2, '0')
    const minute = parsedDate.getMinutes().toLocaleString().padStart(2, '0')

    const formattedDate = `${day}.${month}.${year}, ${hour}:${minute}`

    return formattedDate
}
