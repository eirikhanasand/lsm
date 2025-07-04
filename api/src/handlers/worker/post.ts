import { FastifyReply, FastifyRequest } from 'fastify'
import fetchOSV from '../../utils/fetchOSV.js'
import { DownloadStatus } from '../../interfaces.js'

type ParseProps = {
    ecosystem: string
    data: WorkerData
    res: FastifyReply
    log: string[]
}

type ParseResponse = {
    name: string | null
    version: string | null
    ecosystem?: string | null
} | FastifyReply

/**
 * Endpoint handler for the JFrog Artifactory Worker. Fetches details from OSV,
 * and formats the response to the Worker return format. 
 * 
 * Required body parameter: `data`
 * 
 * @param req Incoming Fastify Request
 * @param res Outgoing Fastify Response
 * 
 * @returns Fastify Response as a JFrog Worker compatible object.
 */
export default async function workerPostHandler(req: FastifyRequest, res: FastifyReply) {
    const data = req.body as WorkerData
    if (!data) {
        return res.status(400).send({ error: 'Missing data.' })
    }

    let ecosystem: string = parseKey(data.repoPath.key)
    const log: string[] = []

    const details = parseData({ ecosystem, data, res, log })
    if (!('name' in details)) {
        return details
    }

    const name = details.name
    const version = details.version
    ecosystem = details.ecosystem || ecosystem

    if (!name || !version) {
        console.warn(`DOWNLOAD STOPPED: Unable to extract name and version - ${data.name}`)
        return res.send({
            status: DownloadStatus.DOWNLOAD_STOP,
            message: `DOWNLOAD STOPPED - Unable to extract package name and version.`,
            log,
            headers: {}
        })
    }

    const osv = await fetchOSV({ name, version, ecosystem, clientAddress: data.clientAddress })
    if ('error' in osv) {
        log.push(osv.error)
        return res.send({
            status: DownloadStatus.DOWNLOAD_STOP,
            message: `DOWNLOAD STOPPED: Unable to fetch OSV.`,
            log,
            headers: {}
        })
    }

    const { response, osvLength } = osv
    if (osvLength) {
        const log = ['OSV data was not empty:', JSON.stringify(response.vulnerabilities)]

        // Title section
        if ('vulnerabilities' in response) {
            log.push('-----------------------------')
            for (const vulnerability of response.vulnerabilities) {
                log.push(...logDetails(vulnerability))
            }
        }

        // Checks allowed packages
        if ('allow' in response) {
            log.push('DOWNLOAD CONTINUED: Vulnerable or malicious but allowed', `Name: ${name}`, `Version: ${version}`, `Ecosystem: ${ecosystem}`)
            return res.send({
                status: DownloadStatus.DOWNLOAD_PROCEED,
                message: `DOWNLOAD CONTINUED: Vulnerable or malicious but allowed.`,
                log,
                headers: {}
            })
        }

        log.push(`DOWNLOAD STOPPED: Vulnerable or malicious, name: ${name}, version: ${version}, ecosystem: ${ecosystem}\n`)
        return res.send({
            status: DownloadStatus.DOWNLOAD_STOP,
            message: `DOWNLOAD STOPPED: Vulnerable or malicious package detected.`,
            log,
            headers: {}
        })
    }

    // Checks blocked packages
    if ('block' in response) {
        log.push(`DOWNLOAD STOPPED: BLOCKED, Name: ${name}, Version: ${version}, Ecosystem: ${ecosystem}`)
        return res.send({
            status: DownloadStatus.DOWNLOAD_STOP,
            message: `DOWNLOAD STOPPED: Blocked.`,
            log,
            headers: {}
        })
    }

    log.push('DOWNLOAD CONTINUED', `Name: ${name}`, `Version: ${version}`, `Ecosystem: ${ecosystem}`)
    return res.send({
        status: DownloadStatus.DOWNLOAD_PROCEED,
        message: `DOWNLOAD CONTINUED: Nothing observed.`,
        log,
        headers: {}
    })
}

/**
 * Parses the ecosystem from the worker. If it includes `-` or `_`, only the 
 * section before `-` or `_` is used, otherwise the input is returned unchanged.
 * 
 * @param key Unparsed ecosystem
 * 
 * @returns key without `-` or `_`
 */
function parseKey(key: string): string {
    if (key.includes('-')) {
        return key.split('-')[0]
    }

    if (key.includes('_')) {
        return key.split('_')[0]
    }

    return key
}

/**
 * Logs details of the vulnerability, such as the severity, versions affected,
 * references and the origin. 
 * 
 * @param vulnerability Vulnerability found in OSV
 * 
 * @returns Array of logs
 */
function logDetails(vulnerability: WorkerVulnerability): string[] {
    const log: string[] = []
    // Severity
    if ('severity' in vulnerability) {
        log.push(`Severity ${vulnerability.database_specific.severity}`)
        // Logs severity details
        for (const severity of (vulnerability.severity || [])) {
            if ('type' in severity && 'score' in severity) {
                log.push(severity.type, severity.score, '-----------------------------')
            }
        }
        log.push('CWEs', vulnerability.database_specific.cwe_ids.join(', '), '-----------------------------')
    }

    // First info section
    log.push(
        `${vulnerability.id} - ${vulnerability.summary}`,
        `Published ${formatDate(vulnerability.published)}`,
        `Modified ${formatDate(vulnerability.modified)}`,
        '-----------------------------',
        ...vulnerability.details.split('\n')
    )

    if (vulnerability.aliases && vulnerability.aliases.length) {
        log.push('Aliases', ...vulnerability.aliases)
    }

    // Versions section
    if ('affected' in vulnerability && Array.isArray(vulnerability.affected)) {
        log.push('-----------------------------')
        log.push('Affected versions:')
        // Logs version details
        for (const affected of vulnerability.affected) {
            if ('versions' in affected && Array.isArray(affected.versions)) {
                log.push(affected.versions.join(', '))
            }
        }
    }

    // Specifics section
    if (
        'malicious-packages-origins' in vulnerability.database_specific
        && Array.isArray(vulnerability.database_specific['malicious-packages-origins'])
    ) {
        log.push('-----------------------------')
        log.push('Specifics')
        // Logs specifics
        for (const detail of vulnerability.database_specific['malicious-packages-origins']) {
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

/**
 * Formats a date to a custom `dd.mm.yyyy, hh:mm` format.
 * 
 * @param date Date to format
 * 
 * @returns Date formatted to the `dd.mm.yyyy, hh:mm` format.
 */
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

/**
 * Extracts the `name`, `version` and `ecosystem` from the worker metadata if
 * possible. Otherwise returns a `FastifyReply` detailing why it was not possible.
 * 
 * @param ecosystem Parsed ecosystem from the metadata
 * @param data Full worker metadata
 * @param res Fastify Response Object
 * @param log String array to be used to store logs
 * 
 * @returns `name`, `version` and optionally `ecosystem`, or a `FastifyReply` 
 */
function parseData({
    ecosystem,
    data,
    res,
    log
}: ParseProps): ParseResponse {
    switch (ecosystem) {
        case 'npm':
            const npmRegex = /^(.+)-(\d+\.\d+\.\d+)\.tgz$/
            const npmDetails = data.name.match(npmRegex)
            if (Array.isArray(npmDetails)) return {
                name: npmDetails[1],
                version: npmDetails[2]
            }
        case 'docker':
            const dockerDetails = data.repoPath.path.split('/')
            return {
                name: dockerDetails[1],
                version: dockerDetails[2],
                ecosystem: dockerDetails[1].includes('ubuntu') ? 'Ubuntu' : 'Debian'
            }
        case 'python':
            const pythonRegex = /\/([\w\-]+)-([\d.]+)-/
            const pythonDetails = data.repoPath.path.match(pythonRegex)
            if (Array.isArray(pythonDetails)) return {
                name: pythonDetails[1],
                version: pythonDetails[2],
                ecosystem: 'PyPI'
            }
        case 'go':
            const goRegex = /([^\/]+\/[^\/]+)\/@v\/v?(\d+\.\d+\.\d+(\.\d+)?)\.(mod|info|zip)/
            const goDetails = data.repoPath.path.match(goRegex)
            if (Array.isArray(goDetails)) return {
                name: goDetails[1],
                version: goDetails[2],
                ecosystem: 'Go'
            }
        case 'maven':
        case 'java':
            // Extracts the name and version from a `java` metadata response
            const javaRegex = /^([^\/]+(?:\/[^\/]+)*)\/([^\/]+)\/([\d.]+)\/\2-[\d.]+(?:-[^\/]+)?\.[^\/]+$/
            const javaDetails = data.repoPath.path.match(javaRegex)
            if (Array.isArray(javaDetails) && javaDetails.length >= 3) {
                return {
                    name: `${javaDetails[1].replaceAll(/\//g, '.')}:${javaDetails[2]}`,
                    version: javaDetails[3],
                    ecosystem: 'Maven'
                }
            // Special case for JFrog internals
            } else if (data.repoPath.path.startsWith('org/jfrog') && data.repoPath.path.endsWith('.xml')) {
                return res.send({
                    status: DownloadStatus.DOWNLOAD_STOP,
                    message: `DOWNLOAD CONTINUED - Unversioned and distributed by JFrog itself.`,
                    log,
                    headers: {}
                })
            }
        case 'ruby':
            // Two cases since Ruby uses two seperate formats.
            const rubyRegex1 = /^([\w-]+)-(\d+\.\d+\.\d+)/
            const rubyDetails1 = data.name.match(rubyRegex1)
            const rubyRegex2 = /([a-zA-Z0-9_-]+)\.(\d+\.\d+)(?:\.gz)?/
            const rubyDetails2 = data.name.match(rubyRegex2)
            if (Array.isArray(rubyDetails1)) {
                return {
                    name: rubyDetails1[1],
                    version: rubyDetails1[2],
                    ecosystem: 'RubyGems'
                }
            } else if (Array.isArray(rubyDetails2)) {
                return {
                    name: rubyDetails2[1],
                    version: rubyDetails2[2],
                    ecosystem: 'RubyGems'
                }
            } else if (data.name === 'versions') {
                return res.send({
                    status: DownloadStatus.DOWNLOAD_STOP,
                    message: `DOWNLOAD CONTINUED - Ruby cache 'versions'. This has no version and is not vulnerable. Will be accepted.`,
                    log,
                    headers: {}
                })
            }
        case 'alpine':
            const alpineRegex = /v\d.\d+\/main\/x86_64\/(\w+).tar.gz/
            const alpineDetails = data.repoPath.path.match(alpineRegex)
            if (Array.isArray(alpineDetails)) {
                if (alpineDetails[1] === 'APKINDEX') {
                    return {
                        name: 'APKINDEX',
                        version: '1.0.0',
                        ecosystem: 'Alpine'
                    }
                } else {
                    return {
                        name: alpineDetails[1],
                        version: alpineDetails[2],
                        ecosystem: 'Alpine'
                    }
                }
            }
        case 'conda':
            const condaRegex = /([a-zA-Z\-]+)-(\d+.\d+.\d+)/
            const condaDetails = data.name.match(condaRegex)
            if (Array.isArray(condaDetails)) {
                return {
                    name: condaDetails[1],
                    version: condaDetails[2],
                    ecosystem: 'PyPI'
                }
            } else {
                return res.send({
                    status: DownloadStatus.DOWNLOAD_STOP,
                    message: `DOWNLOAD STOPPED - Unable to extract package name and version from Conda repository.`,
                    log,
                    headers: {}
                })
            }
        case 'terraform':
            const terraformRegex = /terraform-provider-(\w+)_([\d.]+)/
            const terraformDetails = data.name.match(terraformRegex)
            if (Array.isArray(terraformDetails)) {
                return {
                    name: terraformDetails[1],
                    version: terraformDetails[2],
                    ecosystem: 'GIT'
                }
            }
        case 'cargo-remote':
            const cargoVersionRegex = /\d.+/
            const cargoDetails = data.repoPath.path.match(cargoVersionRegex)
            if (Array.isArray(cargoDetails)) {
                return {
                    name: data.name,
                    version: cargoDetails[0],
                    ecosystem: 'crates.io',
                }
            } else {
                return res.send({
                    status: DownloadStatus.DOWNLOAD_STOP,
                    message: `DOWNLOAD STOPPED - Unable to extract package name and version for Cargo.`,
                    log,
                    headers: {}
                })
            }
        case 'bower':
            const bowerVersionRegex = /(\d.\d.\d)/
            const bowerDetails = data.name.match(bowerVersionRegex)
            if (Array.isArray(bowerDetails)) {
                return {
                    name: parseKey(data.name),
                    version: bowerDetails[0],
                    ecosystem: 'GIT'
                }
            }
        case 'ansible':
            const ansibleVersionRegex = /(\d.\d.\d)/
            const ansibleDetails = data.name.match(ansibleVersionRegex)
            if (Array.isArray(ansibleDetails)) {
                return {
                    name: parseKey(data.name),
                    version: ansibleDetails[0],
                    ecosystem: 'GIT'
                }
            }
        case 'chef':
            const chefVersionRegex = /(\d.\d.\d)/
            const chefDetails = data.name.match(chefVersionRegex)
            if (Array.isArray(chefDetails)) {
                return {
                    name: parseKey(data.name),
                    version: chefDetails[0],
                    ecosystem: 'GIT'
                }
            }
        default:
            const genericVersionRegex = /(\d.\d.\d)/
            const genericDetails = data.name.match(genericVersionRegex)
            if (Array.isArray(genericDetails)) {
                return {
                    name: parseKey(data.name),
                    version: genericDetails[0],
                    ecosystem: 'GIT'
                }
            }
    }

    return {
        name: null,
        version: null,
        ecosystem: null
    }
}
