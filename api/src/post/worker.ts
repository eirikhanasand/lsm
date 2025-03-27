import { FastifyReply, FastifyRequest } from "fastify"
import fetchOSV from "../utils/fetchOSV.js"
import { DownloadStatus } from "../interfaces.js"

export default async function workerPostHandler(req: FastifyRequest, res: FastifyReply) {
    const data = req.body as WorkerData
    if (!data) {
        return res.status(400).send({ error: "Missing data." })
    }

    let name: string | null = null
    let version: string | null = null
    let ecosystem: string = parseKey(data.repoPath.key)
    const log: string[] = []

    switch (ecosystem) {
        case "npm":
            const npmRegex = /([a-zA-Z+_.]+)-([\d.]+)\.tgz/
            const npmDetails = data.name.match(npmRegex)
            if (Array.isArray(npmDetails)) {
                name = npmDetails[1]
                version = npmDetails[2]
            }
            break
        case "docker":
            const dockerDetails = data.repoPath.path.split('/')
            name = dockerDetails[1]
            version = dockerDetails[2]
            ecosystem = dockerDetails[1].includes('ubuntu') ? 'Ubuntu' : 'Debian'
            break
        case "python":
            const pythonRegex = /\/([\w\-]+)-([\d.]+)-/
            const pythonDetails =  data.repoPath.path.match(pythonRegex)
            if (Array.isArray(pythonDetails)) {
                name = pythonDetails[1]
                version = pythonDetails[2]
            }
            ecosystem = "PyPI"
            break
        case "go":
            const goRegex = /([^\/]+\/[^\/]+)\/@v\/v?(\d+\.\d+\.\d+(\.\d+)?)\.(mod|info|zip)/
            const goDetails =  data.repoPath.path.match(goRegex)
            if (Array.isArray(goDetails)) {
                name = goDetails[1]
                version = goDetails[2]
            }
            ecosystem = "Go"
            break
        case "maven":
        case "java":
            const javaRegex = /^([^\/]+(?:\/[^\/]+)*)\/([^\/]+)\/([\d.]+)\/\2-[\d.]+(?:-[^\/]+)?\.[^\/]+$/
            const javaDetails = data.repoPath.path.match(javaRegex)
            if (Array.isArray(javaDetails) && javaDetails.length >= 3) {
                name = `${javaDetails[1].replaceAll(/\//g, '.')}:${javaDetails[2]}`
                version = javaDetails[3]
                ecosystem = "Maven"
            } else if (data.repoPath.path.startsWith('org/jfrog') && data.repoPath.path.endsWith('.xml')) {
                return res.send({
                    status: DownloadStatus.DOWNLOAD_STOP,
                    message: `DOWNLOAD CONTINUED - Unversioned and distributed by JFrog itself.`,
                    log,
                    headers: {}
                })
            }
            break
        case "ruby":
            const rubyRegex1 =  /^([\w-]+)-(\d+\.\d+\.\d+)/
            const rubyDetails1 =  data.name.match(rubyRegex1)
            const rubyRegex2 = /([a-zA-Z0-9_-]+)\.(\d+\.\d+)(?:\.gz)?/
            const rubyDetails2 = data.name.match(rubyRegex2)
            if (Array.isArray(rubyDetails1)) {
                name = rubyDetails1[1]
                version = rubyDetails1[2]
            } else if (Array.isArray(rubyDetails2)) {
                name = rubyDetails2[1]
                version = rubyDetails2[2]
            } else if (data.name === "versions") {
                return res.send({
                    status: DownloadStatus.DOWNLOAD_STOP,
                    message: `DOWNLOAD CONTINUED - Ruby cache 'versions'. This has no version and is not vulnerable. Will be accepted.`,
                    log,
                    headers: {}
                })
            }
            ecosystem = "RubyGems"
            break
        case "alpine":
            const alpineRegex = /v\d.\d+\/main\/x86_64\/(\w+).tar.gz/
            const alpineDetails = data.repoPath.path.match(alpineRegex)
            if (Array.isArray(alpineDetails)) {
                if (alpineDetails[1] === "APKINDEX") {
                    name = "APKINDEX"
                    version = "1.0.0"
                } else {
                    name = alpineDetails[1]
                    version = alpineDetails[2]
                }
            }
            ecosystem = "Alpine"
            break
        case "conda":
            const condaRegex = /([a-zA-Z\-]+)-(\d+.\d+.\d+)/
            const condaDetails = data.name.match(condaRegex)
            if (Array.isArray(condaDetails)) {
                name = condaDetails[1]
                version = condaDetails[2]
                ecosystem = "PyPI"
            } else {
                return res.send({
                    status: DownloadStatus.DOWNLOAD_STOP,
                    message: `DOWNLOAD STOPPED - Unable to extract package name and version from Conda repository.`,
                    log,
                    headers: {}
                })
            }
            break
        case "terraform":
            const terraformRegex = /terraform-provider-(\w+)_([\d.]+)/
            const terraformDetails = data.name.match(terraformRegex)
            if (Array.isArray(terraformDetails)) {
                name = terraformDetails[1]
                version = terraformDetails[2]
            }
            ecosystem = "GIT"
            break
        case "cargo-remote":
            const cargoVersionRegex = /\d.+/
            const cargoDetails = data.repoPath.path.match(cargoVersionRegex)
            if (Array.isArray(cargoDetails)) {
                name = data.name
                version = cargoDetails[0]
                ecosystem = "crates.io"
            } else {
                return res.send({
                    status: DownloadStatus.DOWNLOAD_STOP,
                    message: `DOWNLOAD STOPPED - Unable to extract package name and version for Cargo.`,
                    log,
                    headers: {}
                })
            }
            break
        case "bower":
            const bowerVersionRegex = /(\d.\d.\d)/
            const bowerDetails = data.name.match(bowerVersionRegex)
            if (Array.isArray(bowerDetails)) {
                name = parseKey(data.name)
                version = bowerDetails[0]
                ecosystem = "GIT"
            }
            break
        case "ansible":
            const ansibleVersionRegex = /(\d.\d.\d)/
            const ansibleDetails = data.name.match(ansibleVersionRegex)
            if (Array.isArray(ansibleDetails)) {
                name = parseKey(data.name)
                version = ansibleDetails[0]
                ecosystem = "GIT"
            }
            break
        case "chef":
            const chefVersionRegex = /(\d.\d.\d)/
            const chefDetails = data.name.match(chefVersionRegex)
            if (Array.isArray(chefDetails)) {
                name = parseKey(data.name)
                version = chefDetails[0]
                ecosystem = "GIT"
            }
            break
        default: 
            const genericVersionRegex = /(\d.\d.\d)/
            const genericDetails = data.name.match(genericVersionRegex)
            if (Array.isArray(genericDetails)) {
                name = parseKey(data.name)
                version = genericDetails[0]
                ecosystem = "GIT"
            }
            break
    }

    if (!name || !version) {
        console.log(`DOWNLOAD STOPPED: UNABLE TO EXTRACT NAME AND VERSION - ${data.name}`)
        return res.send({
            status: DownloadStatus.DOWNLOAD_STOP,
            message: `DOWNLOAD STOPPED - Unable to extract package name and version.`,
            log,
            headers: {}
        })
    }

    const { response, osvLength } = await fetchOSV({name, version, ecosystem, clientAddress: data.clientAddress})
    if (osvLength) {
        const log = []
        // TITLE SECTION
        log.push(`DOWNLOAD STOPPED: MALICIOUS, Name: ${name}, Version: ${version}, Ecosystem: ${ecosystem}\n`)
        if ('vulnerabilties' in response) {
            log.push('-----------------------------')
            for (const vulnerability of response.vulnerabilties) {
                log.push(...logDetails(vulnerability.data))
            }
        }
        return res.send({
            status: DownloadStatus.DOWNLOAD_STOP,
            message: `DOWNLOAD STOPPED: Malicious package detected.`,
            log,
            headers: {}
        })
    }
    
    if (JSON.stringify(response) !== '{}') {
        log.push("OSV data was not empty:")
        log.push(JSON.stringify(response))

        // Checking blacklist
        if ('blacklist' in response) {
            log.push(`DOWNLOAD STOPPED: BLACKLISTED, Name: ${name}, Version: ${version}, Ecosystem: ${ecosystem}`)
            return res.send({
                status: DownloadStatus.DOWNLOAD_STOP,
                message: `DOWNLOAD STOPPED: Blacklisted.`,
                log,
                headers: {}
            })
        }

        // Checking whitelist
        if ('whitelist' in response && response.vulnerabilties.length) {
            if ('vulnerabilties' in response) {
                log.push('-----------------------------')
                for (const vulnerability of response.vulnerabilties) {
                    logDetails(vulnerability.data)
                }
            }
            log.push('DOWNLOAD CONTINUED: MALICIOUS BUT WHITELISTED', `Name: ${name}`, `Version: ${version}`, `Ecosystem: ${ecosystem}`)
            return res.send({
                status: DownloadStatus.DOWNLOAD_PROCEED,
                message: `DOWNLOAD CONTINUED: Malicious but whitelisted.`,
                log,
                headers: {}
            })
        }
    }
    
    log.push('DOWNLOAD CONTINUED', `Name: ${name}`, `Version: ${version}`, `Ecosystem: ${ecosystem}`)
    return res.send({
        status: DownloadStatus.DOWNLOAD_PROCEED,
        message: `DOWNLOAD CONTINUED: Nothing observed.`,
        log,
        headers: {}
    })
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

function logDetails(vulnerability: WorkerVulnerability): string[] {
    const log: string[] = []
    // SEVERITY
    if ('severity' in vulnerability) {
        log.push(`Severity ${vulnerability.database_specific.severity}`)
        for (const severity of (vulnerability.severity || [])) {
            if ('type' in severity && 'score' in severity) {
                log.push(severity.type, severity.score, '-----------------------------')
            }
        }
        log.push("CWEs", vulnerability.database_specific.cwe_ids.join(', '), '-----------------------------')
    }

    // FIRST INFO SECTION
    log.push(
        `${vulnerability.id} - ${vulnerability.summary}`,
        `Published ${formatDate(vulnerability.published)}`,
        `Modified ${formatDate(vulnerability.modified)}`,
        '-----------------------------',
        ...vulnerability.details.split('\n')
    )

    if (vulnerability.aliases && vulnerability.aliases.length) {
        log.push("Aliases", ...vulnerability.aliases)
    }

    // VERSIONS SECTION
    if ('affected' in vulnerability && Array.isArray(vulnerability.affected)) {
        log.push('-----------------------------')
        log.push("Affected versions:")
        for (const affected of vulnerability.affected) {
            if ('versions' in affected && Array.isArray(affected.versions)) {
                log.push(affected.versions.join(', '))
            }
        }
    }

    // SPECIFICS SECTION
    if (
        'malicious-packages-origins' in vulnerability.database_specific 
        && Array.isArray(vulnerability.database_specific["malicious-packages-origins"])
    ) {
        log.push('-----------------------------')
        log.push("Specifics")
        for (const detail of vulnerability.database_specific["malicious-packages-origins"]) {
            log.push(
                `SHA256: ${detail.sha256}`,
                `Import time ${formatDate(detail.import_time)}`,
                `Modified time ${formatDate(detail.modified_time)}`,
                `Source: ${detail.source}`
            )
        }
    }

    if (vulnerability.references) {
        log.push(`References\n${JSON.stringify(vulnerability.references)}`)
    }

    return log
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
