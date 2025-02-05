import { PlatformContext, BeforeDownloadRequest, DownloadStatus } from 'jfrog-workers'
import { BeforeDownload } from './interfaces.js';
// LAST IMPORT MUST HAVE SEMICOLON, OTHERWISE JFROG ARTIFACTORY PARSING FAILS

const OSV_URL = "http://129.241.150.86:8080/api/osv"

const NPMtestDataGood = {
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
    "servletContextUrl": "https://<id>.jfrog.io/artifactory",
    "uri": "/artifactory/npm/@types/estree/-/estree-1.0.6.tgz",
    "clientAddress": "18.214.241.149",
    "repoType": 2
}

const NPMtestDataBad = {
    "repoPath": {
        "key": "npm",
        "path": "mathlive/-/mathlive-0.103.0.tgz",
        "id": "npm:mathlive/-/mathlive-0.103.0.tgz"
    },
    "originalRepoPath": {
        "key": "npm",
        "path": "mathlive/-/mathlive-0.103.0.tgz",
        "id": "npm:mathlive/-/mathlive-0.103.0.tgz"
    },
    "name": "mathlive-0.103.0.tgz",
    "ifModifiedSince": -1,
    "clientAddress": "88.95.182.216",
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

const GRADLEtestData = {
    "repoPath": {
        "key": "java-cache",
        "path": "org/jetbrains/kotlin/kotlin-gradle-plugin/1.9.22/kotlin-gradle-plugin-1.9.22-gradle82.jar",
        "id": "java-cache:org/jetbrains/kotlin/kotlin-gradle-plugin/1.9.22/kotlin-gradle-plugin-1.9.22-gradle82.jar"
    },
    "originalRepoPath": {
        "key": "java-cache",
        "path": "org/jetbrains/kotlin/kotlin-gradle-plugin/1.9.22/kotlin-gradle-plugin-1.9.22-gradle82.jar",
        "id": "java-cache:org/jetbrains/kotlin/kotlin-gradle-plugin/1.9.22/kotlin-gradle-plugin-1.9.22-gradle82.jar"
    },
    "name": "kotlin-gradle-plugin-1.9.22-gradle82.jar",
    "modificationTime": -1,
    "lastModified": -1,
    "ifModifiedSince": -1,
    "servletContextUrl": "https://<id>.jfrog.io/artifactory",
    "uri": "/artifactory/java-cache/org/jetbrains/kotlin/kotlin-gradle-plugin/1.9.22/kotlin-gradle-plugin-1.9.22-gradle82.jar",
    "clientAddress": "127.0.0.1"
}

const RUBYtestData = {
    "repoPath": {
    "key": "ruby",
    "path": "quick/Marshal.4.8/bundler-0.3.0.gemspec.rz",
    "id": "ruby:quick/Marshal.4.8/bundler-0.3.0.gemspec.rz"
    },
    "originalRepoPath": {
    "key": "ruby",
    "path": "quick/Marshal.4.8/bundler-0.3.0.gemspec.rz",
    "id": "ruby:quick/Marshal.4.8/bundler-0.3.0.gemspec.rz"
    },
    "name": "bundler-0.3.0.gemspec.rz",
    "ifModifiedSince": -1,
    "clientAddress": "129.241.236.195",
    "repoType": 2
}

const CONDAtestData = {
        "repoPath": {
          "key": "conda",
          "path": "win-64/pytz-2024.1-py312haa95532_0.conda",
          "id": "conda:win-64/pytz-2024.1-py312haa95532_0.conda"
        },
        "originalRepoPath": {
          "key": "conda",
          "path": "win-64/pytz-2024.1-py312haa95532_0.conda",
          "id": "conda:win-64/pytz-2024.1-py312haa95532_0.conda"
        },
        "name": "pytz-2024.1-py312haa95532_0.conda",
        "ifModifiedSince": -1,
        "clientAddress": "85.164.79.145",
        "repoType": 2
}

const TERRAFORMtestData = {
    "repoPath": {
      "key": "terraform",
      "path": "terraform-provider-aws/5.84.0/terraform-provider-aws_5.84.0_darwin_arm64.zip",
      "id": "terraform:terraform-provider-aws/5.84.0/terraform-provider-aws_5.84.0_darwin_arm64.zip"
    },
    "originalRepoPath": {
      "key": "terraform",
      "path": "terraform-provider-aws/5.84.0/terraform-provider-aws_5.84.0_darwin_arm64.zip",
      "id": "terraform:terraform-provider-aws/5.84.0/terraform-provider-aws_5.84.0_darwin_arm64.zip"
    },
    "name": "terraform-provider-aws_5.84.0_darwin_arm64.zip",
    "ifModifiedSince": -1,
    "clientAddress": "100.72.90.23",
    "repoType": 2
}

// const metadata = NPMtestData
// const metadata = DOCKERtestData
// const metadata = PYTHONtestData
// const metadata = GRADLEtestData
// const metadata = GOtestData
// const metadata = RUBYtestData
// const metadata = NPMtestDataBad
// const metadata = CONDAtestData
// const metadata = TERRAFORMtestData

export default async function runWorker(context: PlatformContext, data: BeforeDownloadRequest): Promise<BeforeDownload> {

    const metadata = data.metadata
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

    if ((hashData.data as any).length) {
        // TITLE SECTION
        prettyLog(['DOWNLOAD STOPPED: MALICIOUS', `Name: ${name}`, `Version: ${version}`, `Key: ${key}`])
        if ('vulns' in hashData.data) {
            console.log('-----------------------------')
            for (const vulnerability of hashData.data.vulns) {
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
        const response = await context.clients.axios.get(`${OSV_URL}/${ecosystem}/${name}/${version}/`) 
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
    // SEVERITY
    if ('severity' in vulnerability) {
        console.log(`Severity ${vulnerability.database_specific.severity}`)
        for (const severity of vulnerability.severity) {
            if ('type' in severity && 'score' in severity) {
                prettyLog([severity.type, severity.score, '-----------------------------'])
            }
        }
        prettyLog(["CWEs", vulnerability.database_specific.cwe_ids.join(', '), '-----------------------------'])
    }

    // FIRST INFO SECTION
    prettyLog([
        `${vulnerability.id} - ${vulnerability.summary}`,
        `Published ${formatDate(vulnerability.published)}`,
        `Modified ${formatDate(vulnerability.modified)}`,
        '-----------------------------',
        ...vulnerability.details.split('\n')
    ])

    if (vulnerability.aliases && vulnerability.aliases.length) {
        prettyLog(["Aliases", ...vulnerability.aliases])
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
            prettyLog([
                `SHA256: ${detail.sha256}`,
                `Import time ${formatDate(detail.import_time)}`,
                `Modified time ${formatDate(detail.modified_time)}`,
                `Source: ${detail.source}`
            ])
        }
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
