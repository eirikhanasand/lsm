import { PlatformContext, BeforeDownloadRequest, DownloadStatus } from 'jfrog-workers'
import { BeforeDownload } from './interfaces.js';
// LAST IMPORT MUST HAVE SEMICOLON, OTHERWISE JFROG ARTIFACTORY PARSING FAILS

const OSV_URL = "http://129.241.150.86:8080/api/osv"

const NPMtestDataGood = {
    "repoPath": {
      "key": "npm",
      "path": "@types/react/-/react-17.0.0.tgz",
      "id": "npm:@types/react/-/react-17.0.0.tgz"
    },
    "originalRepoPath": {
      "key": "npm",
      "path": "@types/react/-/react-17.0.0.tgz",
      "id": "npm:@types/react/-/react-17.0.0.tgz"
    },
    "name": "react-17.0.0.tgz",
    "servletContextUrl": "https://<id>.jfrog.io/artifactory",
    "uri": "/artifactory/npm/@types/react/-/react-17.0.0.tgz",
    "clientAddress": "18.214.241.149",
    "repoType": 2
}

export default async function runWorker(context: PlatformContext, data: BeforeDownloadRequest): Promise<BeforeDownload> {

    const metadata = data.metadata
    // const metadata = NPMtestDataGood
    let name: string | null = null
    let version: string | null = null
    let key: string = parseKey(metadata.repoPath.key)

    switch (key) {
        case "npm":
            const npmRegex = /([a-zA-Z+_.]+)-([\d.]+)\.tgz/
            const npmDetails = metadata.name.match(npmRegex)
            name = npmDetails[1]
            version = npmDetails[2]
            break
        case "docker":
            const dockerDetails = metadata.repoPath.path.split('/')
            name = dockerDetails[1]
            version = dockerDetails[2]
            key = dockerDetails[1].includes('ubuntu') ? 'Ubuntu' : 'Debian'
            break
        case "python":
            const pythonRegex = /\/([\w\-]+)-([\d.]+)-/
            const pythonDetails =  metadata.repoPath.path.match(pythonRegex)
            name = pythonDetails[1]
            version = pythonDetails[2]
            key = "PyPI"
            break
        case "go":
            const goRegex = /([^\/]+\/[^\/]+)\/@v\/v?(\d+\.\d+\.\d+(\.\d+)?)\.(mod|info|zip)/
            const goDetails =  metadata.repoPath.path.match(goRegex)
            name = goDetails[1]
            version = goDetails[2]
            key = "Go"
            break
        case "maven":
        case "java":
            const javaRegex = /^([^\/]+(?:\/[^\/]+)*)\/([^\/]+)\/([\d.]+)\/\2-[\d.]+(?:-[^\/]+)?\.[^\/]+$/
            const javaDetails = metadata.repoPath.path.match(javaRegex)
            if (Array.isArray(javaDetails) && javaDetails.length >= 3) {
                name = `${javaDetails[1].replaceAll(/\//g, '.')}:${javaDetails[2]}`
                version = javaDetails[3]
                key = "Maven"
            } else if (metadata.repoPath.path.startsWith('org/jfrog') && metadata.repoPath.path.endsWith('.xml')) {
                return {
                    status: DownloadStatus.DOWNLOAD_STOP,
                    message: `DOWNLOAD CONTINUED - Unversioned and distributed by JFrog itself.`,
                    // @ts-ignore, doesnt exist locally but does exist remotely
                    headers: {}
                }
            }
            break
        case "ruby":
            const rubyRegex1 =  /^([\w-]+)-(\d+\.\d+\.\d+)/
            const rubyDetails1 =  metadata.name.match(rubyRegex1)
            const rubyRegex2 = /([a-zA-Z0-9_-]+)\.(\d+\.\d+)(?:\.gz)?/
            const rubyDetails2 = metadata.name.match(rubyRegex2)
            if (Array.isArray(rubyDetails1)) {
                name = rubyDetails1[1]
                version = rubyDetails1[2]
            } else if (Array.isArray(rubyDetails2)) {
                name = rubyDetails2[1]
                version = rubyDetails2[2]
            } else if (metadata.name === "versions") {
                return {
                    status: DownloadStatus.DOWNLOAD_STOP,
                    message: `DOWNLOAD CONTINUED - Ruby cache 'versions'. This has no version and is not vulnerable. Will be accepted.`,
                    // @ts-ignore, doesnt exist locally but does exist remotely
                    headers: {}
                }
            }
            key = "RubyGems"
            break
        case "alpine":
            const alpineRegex = /v\d.\d+\/main\/x86_64\/(\w+).tar.gz/
            const alpineDetails = metadata.repoPath.path.match(alpineRegex)
            if (alpineDetails[1] === "APKINDEX") {
                name = "APKINDEX"
                version = "1.0.0"
            } else {
                name = alpineDetails[1]
                version = alpineDetails[2]
            }
            key = "Alpine"
            break
        case "conda":
            const condaRegex = /([a-zA-Z\-]+)-(\d+.\d+.\d+)/
            const condaDetails = metadata.name.match(condaRegex)
            if (Array.isArray(condaDetails)) {
                name = condaDetails[1]
                version = condaDetails[2]
                key = "PyPI"
            } else {
                return {
                    status: DownloadStatus.DOWNLOAD_STOP,
                    message: `DOWNLOAD STOPPED - Unable to extract package name and version from Conda repository.`,
                    headers: {}
                }
            }
            break
        case "terraform":
            const terraformRegex = /terraform-provider-(\w+)_([\d.]+)/
            const terraformDetails = metadata.name.match(terraformRegex)
            name = terraformDetails[1]
            version = terraformDetails[2]
            key = "GIT"
            break
        case "cargo-remote":
            const cargoVersionRegex = /\d.+/
            const cargoDetails = metadata.repoPath.path.match(cargoVersionRegex)
            if (Array.isArray(cargoDetails)) {
                name = metadata.name
                version = cargoDetails[0]
                key = "crates.io"
            } else {
                return {
                    status: DownloadStatus.DOWNLOAD_STOP,
                    message: `DOWNLOAD STOPPED - Unable to extract package name and version for Cargo.`,
                    headers: {}
                }
            }
            break
        case "bower":
            const bowerVersionRegex = /(\d.\d.\d)/
            const bowerDetails = metadata.name.match(bowerVersionRegex)
            if (Array.isArray(bowerDetails)) {
                name = parseKey(metadata.name)
                version = bowerDetails[0]
                key = "GIT"
            }
            break
        case "ansible":
            const ansibleVersionRegex = /(\d.\d.\d)/
            const ansibleDetails = metadata.name.match(ansibleVersionRegex)
            if (Array.isArray(ansibleDetails)) {
                name = parseKey(metadata.name)
                version = ansibleDetails[0]
                key = "GIT"
            }
            break
        case "chef":
            const chefVersionRegex = /(\d.\d.\d)/
            const chefDetails = metadata.name.match(chefVersionRegex)
            if (Array.isArray(chefDetails)) {
                name = parseKey(metadata.name)
                version = chefDetails[0]
                key = "GIT"
            }
            break
        default: 
            const genericVersionRegex = /(\d.\d.\d)/
            const genericDetails = metadata.name.match(genericVersionRegex)
            if (Array.isArray(genericDetails)) {
                name = parseKey(metadata.name)
                version = genericDetails[0]
                key = "GIT"
            }
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

    const osvData = await fetchOSV(context, name, version, key)
    console.log(osvData)
    if (osvData.status !== 200) {
        log('DOWNLOAD STOPPED: UNABLE TO FETCH OSV', `Name: ${name}`, `Version: ${version}`, `Key: ${key}`)
        console.log(osvData)
        return {
            status: DownloadStatus.DOWNLOAD_STOP,
            message: `DOWNLOAD STOPPED - Unable to fetch package info from OSV.`,
            // @ts-ignore - Required field, doesnt exist locally but does exist remotely
            headers: {}
        }
    }

    if ((osvData.data as any).length) {
        // TITLE SECTION
        log('DOWNLOAD STOPPED: MALICIOUS', `Name: ${name}`, `Version: ${version}`, `Key: ${key}`)
        if ('vulnerabilties' in osvData.data) {
            console.log('-----------------------------')
            for (const vulnerability of osvData.data.vulnerabilties) {
                logDetails(vulnerability)
            }
        }
        return {
            status: DownloadStatus.DOWNLOAD_STOP,
            message: `DOWNLOAD STOPPED: Malicious package detected.`,
            // @ts-ignore - Required field, doesnt exist locally but does exist remotely
            headers: {}
        }
    }
    
    if (JSON.stringify(osvData.data) !== '{}') {
        console.log("OSV data was not empty:")
        console.log(osvData.data)

        // Checking blacklist
        if ('blacklist' in osvData.data) {
            log('DOWNLOAD STOPPED: BLACKLISTED', `Name: ${name}`, `Version: ${version}`, `Key: ${key}`)
            return {
                status: DownloadStatus.DOWNLOAD_STOP,
                message: `DOWNLOAD STOPPED: Blaclisted.`,
                headers: {}
            }
        }

        // Checking whitelist
        if ('whitelist' in osvData.data && osvData.data.vulnerabilties.length) {
            if ('vulns' in osvData.data) {
                console.log('-----------------------------')
                for (const vulnerability of osvData.data.vulnerabilties) {
                    logDetails(vulnerability)
                }
            }
            log('DOWNLOAD CONTINUED: MALICIOUS BUT WHITELISTED', `Name: ${name}`, `Version: ${version}`, `Key: ${key}`)
            return {
                status: DownloadStatus.DOWNLOAD_STOP,
                // status: DownloadStatus.DOWNLOAD_PROCEED,
                message: `DOWNLOAD CONTINUED: Malicious but whitelisted.`,
                headers: {}
            }
        }
    }
    
    log('DOWNLOAD CONTINUED', `Name: ${name}`, `Version: ${version}`, `Key: ${key}`)
    return {
        status: DownloadStatus.DOWNLOAD_STOP,
        // status: DownloadStatus.DOWNLOAD_PROCEED,
        message: `DOWNLOAD CONTINUED: Nothing observed.`,
        headers: {}
    }
}

async function fetchOSV(context: PlatformContext, name: string, version: string, ecosystem: string): Promise<GoogleStatus> {
    try {
        const response = await context.clients.axios.get(`${OSV_URL}/${ecosystem}/${name}/${version}`) 
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

function log(...logs: any[]): void {
    for (const log of logs) {
        console.log(log)
    }
}

function logDetails(vulnerability: Vulnerability): void {
    // SEVERITY
    if ('severity' in vulnerability) {
        console.log(`Severity ${vulnerability.database_specific.severity}`)
        for (const severity of vulnerability.severity) {
            if ('type' in severity && 'score' in severity) {
                log(severity.type, severity.score, '-----------------------------')
            }
        }
        log("CWEs", vulnerability.database_specific.cwe_ids.join(', '), '-----------------------------')
    }

    // FIRST INFO SECTION
    log(
        `${vulnerability.id} - ${vulnerability.summary}`,
        `Published ${formatDate(vulnerability.published)}`,
        `Modified ${formatDate(vulnerability.modified)}`,
        '-----------------------------',
        ...vulnerability.details.split('\n')
    )

    if (vulnerability.aliases && vulnerability.aliases.length) {
        log("Aliases", ...vulnerability.aliases)
    }

    // VERSIONS SECTION
    if ('affected' in vulnerability && Array.isArray(vulnerability.affected)) {
        console.log('-----------------------------')
        console.log("Affected versions:")
        for (const affected of vulnerability.affected) {
            if ('versions' in affected && Array.isArray(affected.versions)) {
                console.log(affected.versions.join(', '))
            }
        }
    }

    // SPECIFICS SECTION
    if (Array.isArray(vulnerability.database_specific["malicious-packages-origins"])) {
        console.log('-----------------------------')
        console.log("Specifics")
        for (const detail of vulnerability.database_specific["malicious-packages-origins"]) {
            log(
                `SHA256: ${detail.sha256}`,
                `Import time ${formatDate(detail.import_time)}`,
                `Modified time ${formatDate(detail.modified_time)}`,
                `Source: ${detail.source}`
            )
        }
    }

    if (vulnerability.references) {
        log("References", ...vulnerability.references)
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
