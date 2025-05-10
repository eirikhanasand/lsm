import pkg from 'ae-cvss-calculator'
import run from '../db.js'
import config from '../constants.js'
import { DownloadStatus } from '../interfaces.js'
import { loadSQL } from './loadSQL.js'

const { DEFAULT_MAL_SEVERITY, DEFAULT_CVE_SEVERITY, DEFAULT_SEVERITY } = config
const { Cvss4P0, Cvss3P1 } = pkg

/**
 * Inserts a download event into the database.
 * 
 * @param event Event to insert into the database
 * 
 * @returns The first row of the result, or an error if the operation was
 * unsuccessful.
 */
export async function insertDownloadEvent(event: DownloadEvent): Promise<any> {
    const query = (await loadSQL('download.sql'))

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

/**
 * Processes vulnerabilties to a standard format including `package_name`, 
 * `package_version`, `ecosystem`, `client_address`, `status`, `reason`, 
 * `severity` and then inserts it into the database. Logs the error if 
 * unsuccessful, since the client is only concerned with whether the package
 * included vulnerabilities, not whether the insert database event to track it 
 * was successful.
 * 
 * @param response Response from OSV
 * @param name Package name
 * @param version Package version
 * @param ecosystem Package ecosystem
 * @param clientAddress The IP of the client that fetched OSV.
 * 
 * @returns void
 */
export async function processVulnerabilities({
    response,
    name,
    version,
    ecosystem,
    clientAddress
}: ProcessVulnerabilitiesProps) {
    try {
        if ('vulnerabilities' in response && response.vulnerabilities.length) {
            const { vulnerabilities } = response
            for (const vuln of vulnerabilities) {
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
            }
        } else {
            const event = {
                package_name: name,
                package_version: version,
                ecosystem,
                client_address: clientAddress,
                status: DownloadStatus.DOWNLOAD_PROCEED,
                reason: "Legitimate",
                severity: "0"
            } as DownloadEvent
            await insertDownloadEvent(event)
        }
    } catch (error) {
        console.error(error)
    }
}

/**
 * Checks whether a package should be stopped or allowed. If it includes an 
 * `allow` parameter, it will pass, otherwise if the response is not empty that
 * means vulnerabilties are found, and it will be stopped. If the response was
 * empty it will also pass.
 * 
 * @param response OSV response
 * 
 * @returns Status detailing whether the package should be stopped or allowed.
 */
async function checkPackage({ response }: { response: OSVResponse }): Promise<number> {
    if (!response || response.vulnerabilities?.length) {
        if ('allow' in response) {
            return DownloadStatus.DOWNLOAD_PROCEED
        }
        return DownloadStatus.DOWNLOAD_STOP
    }
    if (JSON.stringify(response) !== '{}') {
        if ('block' in response) {
            return DownloadStatus.DOWNLOAD_STOP
        }
    }
    return DownloadStatus.DOWNLOAD_PROCEED
}
