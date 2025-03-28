import pkg from 'ae-cvss-calculator'
import run from "../db.js"
import { API, DEFAULT_MAL_SEVERITY } from "../constants.js"
import { DownloadStatus } from '../interfaces.js'
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
        console.error('Error inserting download event:', error)
        // Caught in parent function
        throw error
    }
}

export async function processVulnerabilities({response, name, version, ecosystem, clientAddress}: ProcessVulnerabiltiesProps) {
    try {
        const { vulnerabilties } = response

        for (const vuln of vulnerabilties) {
            console.log(vuln)
            console.log(vuln.data)

            const status: number = await checkPackage({response})
            console.log(status)
            const vulnName = vuln.name

            let severity = -1

            if (vuln.data.severity != null) {
                console.log("severity data:")
                console.log(vuln.data.severity)

                const cvss_v4 = vuln.data.severity.find(
                    (elem: { type: string }) => elem.type === "CVSS_V4"
                )

                const cvss_v3 = vuln.data.severity.find(
                    (elem: { type: string }) => elem.type === "CVSS_V3"
                )

                if (cvss_v4 != null) {
                    const cvss4 = new Cvss4P0(cvss_v4.score)
                    severity = cvss4.calculateScores().overall
                } else if (cvss_v3 != null) {
                    const cvss3 = new Cvss3P1(cvss_v3.score)
                    severity = cvss3.calculateScores().overall
                }
            } else {
                if (vulnName.startsWith("CVE")) {
                    const CVE = await fetch(`${API}/cve/${vulnName}`)
                }
                if (vulnName.startsWith("MAL")) {
                    console.log("MAL!!!!!")
                    severity = Number(DEFAULT_MAL_SEVERITY)
                }
            }
            const event =  {
                package_name: name,
                package_version: version,
                ecosystem,
                client_address: clientAddress,
                status,
                reason: vuln.data.details,
                severity: severity.toString()
            } as DownloadEvent

            await insertDownloadEvent(event)
            console.log(`Inserted event for ${event.package_name} ${event.package_version}`)
        }
    } catch (error) {
        console.log(error)
    }
}

async function checkPackage({response}: {response: OSVResponse}) : Promise<number> {
    if (!response || !response.vulnerabilties?.length) {
        return DownloadStatus.DOWNLOAD_STOP
    }
    if (JSON.stringify(response) !== '{}') {
        if ('blacklist' in response) {
            return DownloadStatus.DOWNLOAD_STOP
        }
    }
    return DownloadStatus.DOWNLOAD_PROCEED
}
