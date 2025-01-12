import { PlatformContext, BeforeDownloadRequest, DownloadStatus } from 'jfrog-workers'
import { BeforeDownload } from './interfaces.js';
// LAST IMPORT MUST HAVE SEMICOLON, OTHERWISE JFROG ARTIFACTORY PARSING FAILS

const OSV_URL = "https://api.osv.dev/v1/query"
const parseNameToNameAndVersion = /^([a-zA-Z0-9-]+)-([\d\.]+)\.tgz$/

export default async function runWorker(context: PlatformContext, data: BeforeDownloadRequest): Promise<BeforeDownload> {
    const nameAndVersion = data.metadata.name.match(parseNameToNameAndVersion)
    if (!nameAndVersion) {
        console.log(`DOWNLOAD STOPPED: UNABLE TO EXTRACT NAME AND VERSION - ${data.metadata.name}`)
        return {
            status: DownloadStatus.DOWNLOAD_STOP,
            message: `DOWNLOAD STOPPED - Unable to extract package name and version.`,
            // @ts-ignore, doesnt exist locally but does exist remotely
            headers: {}
        }
    }

    const key = parseKey(data.metadata.repoPath.key)
    const hashData = await checkHash(context, nameAndVersion[1], nameAndVersion[2], key)
    if (hashData.status !== 200) {
        prettyLog(['DOWNLOAD STOPPED: UNABLE TO FETCH', `Name: ${nameAndVersion[1]}`, `Version: ${nameAndVersion[2]}`, `Key: ${key}`])
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
        prettyLog(['DOWNLOAD STOPPED: MALICIOUS', `Name: ${nameAndVersion[1]}`, `Version: ${nameAndVersion[2]}`, `Key: ${key}`])
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

    prettyLog(['DOWNLOAD CONTINUED', `Name: ${nameAndVersion[1]}`, `Version: ${nameAndVersion[2]}`, `Key: ${key}`])
    
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
    console.log('-----------------------------');
    console.log("Affected versions:")
    for (const affected of vulnerability.affected) {
        console.log(affected.versions.join(', '))
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
