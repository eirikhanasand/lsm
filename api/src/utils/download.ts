import pkg from 'ae-cvss-calculator'
import run from "../db.js"
import {API, DEFAULT_MAL_SEVERITY} from "../constants.js"
import {DownloadStatus} from '../interfaces.js'

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
    if (!response?.vulnerabilties || !Array.isArray(response.vulnerabilties)) {
        console.error(`Invalid response format for ${name}@${version}: Missing or invalid 'vulnerabilities' array.`);
        return;
    }
    const { vulnerabilties } = response;

    if (vulnerabilties.length === 0) {
        return;
    }
    try {
        for (const vuln of vulnerabilties) {
            console.log("vuln data:")
            console.log(vuln)
            await processSingleVulnerability(response, vuln, name, version, ecosystem, clientAddress);
        }
    } catch (error) {
        console.error(`Error processing vulnerabilities batch for ${name}@${version}:`, error);
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

async function processSingleVulnerability(
    response: OSVResponse,
    vuln: any,
    packageName: string,
    packageVersion: string,
    ecosystem: string,
    clientAddress: string
) {
    const vulnIdentifier = vuln?.id || vuln?.name || 'unknown_vulnerability';
    try {
        const status: number = await checkPackage({response});

        const vulnName = vuln?.name || vuln?.id || '';
        const severity = await determineSeverity(vuln, vulnName);
        const reason = vuln?.data?.details || vuln?.details || 'No details provided';

        const event: DownloadEvent = {
            package_name: packageName,
            package_version: packageVersion,
            ecosystem,
            client_address: clientAddress,
            status,
            reason,
            severity: severity.toString(),
        };
        await insertDownloadEvent(event);

    } catch (error) {
        console.error(`Failed to process vulnerability ${vulnIdentifier} for ${packageName}@${packageVersion}:`, error);
        throw error;
    }
}


function getSeverityFromCvss(severityEntries: any[]): number | null {
    if (!Array.isArray(severityEntries)) {
        return null;
    }
    const cvssV4 = severityEntries.find((elem: any) => elem?.type === "CVSS_V4");
    if (cvssV4?.score) {
        try {
            const cvss4 = new Cvss4P0(cvssV4.score);
            return cvss4.calculateScores().overall;
        } catch (e) {
            console.error("Error calculating CVSSv4 score:", e);
        }
    }
    const cvssV3 = severityEntries.find((elem: any) => elem?.type === "CVSS_V3");
    if (cvssV3?.score) {
        try {
            const cvss3 = new Cvss3P1(cvssV3.score);

            return cvss3.calculateScores().overall;
        } catch (e) {
            console.error("Error calculating CVSSv3 score:", e);
        }
    }
    return null;
}

async function getSeverityFromCveApi(vuln: any, vulnName: string): Promise<number> {
    let cveIdentifier: string | undefined;

    if (Array.isArray(vuln?.aliases)) {
        cveIdentifier = vuln.aliases.find((alias: unknown): alias is string =>
            typeof alias === 'string' && alias.startsWith("CVE")
        );
    }
    if (!cveIdentifier && vulnName.startsWith("CVE")) {
        cveIdentifier = vulnName;
    }
    if (!cveIdentifier) {
        return -1;
    }

    try {
        const cveResponse = await fetch(`${API}/cve/${cveIdentifier}`);

        if (!cveResponse.ok) {
            console.error(`Failed to fetch CVE ${cveIdentifier}: ${cveResponse.status} ${cveResponse.statusText}`);
            return -1;
        }
        const cveData = await cveResponse.json();

        if (cveData?.severity?.cvss3_score != null) {
            const score = parseFloat(cveData.severity.cvss3_score);

            if (!isNaN(score)) {
                return score;
            } else {
                console.warn(`Could not parse severity score ('${cveData.severity.cvss3_score}') as number for CVE ${cveIdentifier}.`);
                return -1; // Parsing failed
            }
        } else {
            return -1;
        }

    } catch (error) {
        console.error(`Error fetching or processing CVE ${cveIdentifier}:`, error);
        return -1;
    }
}

async function determineSeverity(vuln: any, vulnName: string): Promise<number> {
    const DEFAULT_SEVERITY = -1;
    const DEFAULT_MAL_SEVERITY_NUM = Number(DEFAULT_MAL_SEVERITY) || 6.9;

    const severityEntries = vuln?.data?.severity || (Array.isArray(vuln?.severity) ? vuln.severity : null);
    let severity = getSeverityFromCvss(severityEntries);
    if (severity !== null) {
        return severity;
    }

    if (typeof vuln?.severity === 'number') {
        return vuln.severity;
    }

    if (vulnName.startsWith("MAL")) {
        return DEFAULT_MAL_SEVERITY_NUM;
    }

    severity = await getSeverityFromCveApi(vuln, vulnName);
    if (severity !== null) {
        return severity;
    }

    console.warn(`Could not determine severity for vulnerability: ${vulnName || vuln?.id || 'unknown'}. Using default ${DEFAULT_SEVERITY}.`);
    return DEFAULT_SEVERITY;
}