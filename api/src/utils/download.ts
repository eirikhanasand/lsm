import pkg from 'ae-cvss-calculator'
import run from '../db.js'
import config from '../constants.js'
import { DownloadStatus } from '../interfaces.js'
const { DEFAULT_MAL_SEVERITY, DEFAULT_CVE_SEVERITY, DEFAULT_SEVERITY } = config
const { Cvss4P0, Cvss3P1 } = pkg

export async function insertDownloadEvent(event: DownloadEvent): Promise<any> {
    const query = `
        INSERT INTO download_events (package_name, package_version, ecosystem, client_address, status, reason, severity)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        ON CONFLICT (timestamp, package_name, package_version, client_address) DO NOTHING
        RETURNING *;
    `

    try {
        const result = await run(query, [
            event.package_name,
            event.package_version,
            event.ecosystem,
            event.client_address,
            String(event.status),
            event.reason,
            event.severity,
        ])
        return result.rows[0]
    } catch (error) {
        console.error(`Error inserting download event: ${JSON.stringify(error)}`)
        // Caught in parent function
        throw error
    }
}

export async function processVulnerabilities({
    response,
    name,
    version,
    ecosystem,
    clientAddress
}: ProcessVulnerabiltiesProps) {
    try {
        const { vulnerabilties } = response
        for (const vuln of vulnerabilties) {
            const status: number = await checkPackage({ response })
            const vulnName = vuln.name || vuln.id || ''
            let severity = -1
            if ('severity' in vuln && vuln.severity != null) {
                const cvss_v4 = vuln.severity.find(
                    (elem: { type: string }) => elem.type === 'CVSS_V4'
                )
                const cvss_v3 = vuln.severity.find(
                    (elem: { type: string }) => elem.type === 'CVSS_V3'
                )
                if (cvss_v4 != null) {
                    const cvss4 = new Cvss4P0(cvss_v4.score)
                    severity = cvss4.calculateScores().overall
                } else if (cvss_v3 != null) {
                    const cvss3 = new Cvss3P1(cvss_v3.score)
                    severity = cvss3.calculateScores().overall
                } else {
                    severity = Number(DEFAULT_CVE_SEVERITY) || 6.0
                }
            } else {
                if (vulnName.startsWith('MAL')) {
                    severity = Number(DEFAULT_MAL_SEVERITY) || 8.0
                } else {
                    severity = Number(DEFAULT_SEVERITY) || 5.0
                }
            }
            const event = {
                package_name: name,
                package_version: version,
                ecosystem,
                client_address: clientAddress,
                status,
                reason: vuln?.details,
                severity: severity.toString()
            } as DownloadEvent

            await insertDownloadEvent(event)
            console.log(`Inserted event for ${event.package_name} ${event.package_version}`)
        }
    } catch (error) {
        console.log(error)
    }
}

async function checkPackage({ response }: { response: OSVResponse }): Promise<number> {
    if (!response || response.vulnerabilties?.length) {
        if ('whitelist' in response) {
            return DownloadStatus.DOWNLOAD_PROCEED
        }
        return DownloadStatus.DOWNLOAD_STOP
    }
    if (JSON.stringify(response) !== '{}') {
        if ('blacklist' in response) {
            return DownloadStatus.DOWNLOAD_STOP
        }
    }
    return DownloadStatus.DOWNLOAD_PROCEED
}
