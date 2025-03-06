import run from "../db.js";

type DownloadEvent = {
    package_name: string;
    package_version: string;
    ecosystem: string;
    repository: string;
    client_address: string;
    status: 'passed' | 'blocked';
    reason: string;
};

export async function insertDownloadEvent(event: DownloadEvent): Promise<any> {
    const query = `
    INSERT INTO download_events (package_name, package_version, ecosystem, client_address, status, reason, repository)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    ON CONFLICT (timestamp, package_name, package_version, client_address) DO NOTHING
    RETURNING *;
  `;

    try {
        const result = await run(query, [
            event.package_name,
            event.package_version,
            event.ecosystem,
            event.client_address,
            event.status,
            event.reason,
            event.repository,
        ]);
        return result.rows[0];
    } catch (error) {
        console.error('Error inserting download event:', error);
        throw error;
    }
}

export async function processVulnerabilities(response: any) {
    try {
        const { vulnerabilties } = response

        for (const vuln of vulnerabilties) {
            console.log(vuln)
            console.log(vuln.data)

            const event =  {
                package_name: vuln.package_name,
                package_version: vuln.version_introduced,
                ecosystem: vuln.ecosystem,
                client_address: '0.0.0.0',
                status: 'blocked',
                reason: vuln.data.details,
            } as DownloadEvent;

            await insertDownloadEvent(event);
            console.log(`Inserted event for ${event.package_name} ${event.package_version}`);
        }
    } catch (error) {
        console.log(error)
    }

}