import run from "../db.js"
import {API} from "../constants.js";
import pkg from 'ae-cvss-calculator';
const { Cvss4P0, Cvss3P1 } = pkg;

type DownloadEvent = {
    package_name: string
    package_version: string
    ecosystem: string
    repository: string
    client_address: string
    status: 'passed' | 'blocked',
    reason: string,
    severity: string
}

type APIOSVResponse = {
    status: any,
    message: any,
    headers: any
}

type GoogleStatus = {
    status: number
    data: {
        whitelist?: any[]
        blacklist?: any[]
        vulnerabilties: Vulnerability[]
    }
}

export async function insertDownloadEvent(event: DownloadEvent): Promise<any> {
    const query = `
    INSERT INTO download_events (package_name, package_version, ecosystem, client_address, status, reason, repository, severity)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    ON CONFLICT (timestamp, package_name, package_version, client_address) DO NOTHING
    RETURNING *;
  `

    try {
        const result = await run(query, [
            event.package_name,
            event.package_version,
            event.ecosystem,
            event.client_address,
            event.status,
            event.reason,
            event.repository,
            event.severity,
        ])
        return result.rows[0]
    } catch (error) {
        console.error('Error inserting download event:', error)
        throw error
    }
}

export async function processVulnerabilities(response: any) {
    console.log("PROCESSING")

    try {
        const { vulnerabilties } = response

        for (const vuln of vulnerabilties) {
            console.log(vuln)
            console.log(vuln.data)

            const packageResponse: APIOSVResponse = await checkPackage(vuln.package_name, vuln.version_introduced, vuln.ecosystem)
            console.log(packageResponse)
            const vulnName = vuln.name

            let severity = -1 // -1 if no severity score found.

            if (vuln.data.severity != null) {
                console.log("severity data:")
                console.log(vuln.data.severity)

                const cvss_v4 = vuln.data.severity.find(
                    (elem: { type: string }) => elem.type === "CVSS_V4"
                );

                const cvss_v3 = vuln.data.severity.find(
                    (elem: { type: string }) => elem.type === "CVSS_V3"
                );

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
                    severity = 6.9
                }
            }
            const event =  {
                package_name: vuln.package_name,
                package_version: vuln.version_introduced,
                ecosystem: vuln.ecosystem,
                client_address: '0.0.0.0',
                status: packageResponse.status,
                reason: vuln.data.details,
                repository: vuln.repository,
                severity: severity.toString()
            } as DownloadEvent

            await insertDownloadEvent(event)
            console.log(`Inserted event for ${event.package_name} ${event.package_version}`)
        }
    } catch (error) {
        console.log(error)
    }
}


async function fetchOSV(name: string, version: string, ecosystem: string): Promise<GoogleStatus | null> {
    try {
        const response = await fetch(`${API}/${ecosystem}/${name}/${version}`);
        const jsonData = await response.json();

        return {
            status: 200,
            data: jsonData
        } as GoogleStatus;
    } catch (error) {
        return null;
    }
}


async function checkPackage(name: string | null, version: string | null, key: string | null) : Promise<APIOSVResponse> {
    if (!name || !version || !key) {
        //console.log(`DOWNLOAD STOPPED: UNABLE TO EXTRACT NAME AND VERSION - ${metadata.name}`)
        return {
            status: "stopped",
            message: `DOWNLOAD STOPPED - Unable to extract package name and version.`,
            // @ts-ignore, doesnt exist locally but does exist remotely
            headers: {}
        }
    }

    const osvData = await fetchOSV(name, version, key)

    if (!osvData) return {
        status: "stopped",
        message: `DOWNLOAD STOPPED - Failed to fetch from API..`,
        // @ts-ignore, doesnt exist locally but does exist remotely
        headers: {}
    }

    console.log(osvData)
    if (osvData.status !== 200) {
        console.log('DOWNLOAD STOPPED: UNABLE TO FETCH OSV', `Name: ${name}`, `Version: ${version}`, `Key: ${key}`)

        console.log(osvData)
        return {
            status: "stopped",
            message: `DOWNLOAD STOPPED - Unable to fetch package info from OSV.`,
            // @ts-ignore - Required field, doesn't exist locally but does exist remotely
            headers: {}
        }
    }

    if ((osvData.data as any).length) {
        // TITLE SECTION
        //log('DOWNLOAD STOPPED: MALICIOUS', `Name: ${name}`, `Version: ${version}`, `Key: ${key}`)
        if ('vulnerabilties' in osvData.data) {
            console.log('-----------------------------')
            for (const vulnerability of osvData.data.vulnerabilties) {
                //logDetails(vulnerability)
            }
        }
        return {
            status: "stopped",
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
            //log('DOWNLOAD STOPPED: BLACKLISTED', `Name: ${name}`, `Version: ${version}`, `Key: ${key}`)

            return {
                status: "stopped",
                message: `DOWNLOAD STOPPED: Blacklisted.`,
                headers: {}
            }
        }

        // Checking whitelist
        if ('whitelist' in osvData.data && osvData.data.vulnerabilties.length) {
            if ('vulns' in osvData.data) {
                console.log('-----------------------------')
                for (const vulnerability of osvData.data.vulnerabilties) {
                    //logDetails(vulnerability)
                }
            }
            console.log('DOWNLOAD CONTINUED: MALICIOUS BUT WHITELISTED', `Name: ${name}`, `Version: ${version}`, `Key: ${key}`)
            return {
                status: "passed",
                message: `DOWNLOAD CONTINUED: Malicious but whitelisted.`,
                headers: {}
            }
        }
    }

    //log('DOWNLOAD CONTINUED', `Name: ${name}`, `Version: ${version}`, `Key: ${key}`)
    return {
        status: "passed",
        message: `DOWNLOAD CONTINUED: Nothing observed.`,
        headers: {}
    }
}
