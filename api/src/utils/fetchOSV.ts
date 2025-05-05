import run from '../db.js'
import fetchList from './list/fetchList.js'
import { processVulnerabilities } from './download.js'
import config from '../constants.js'

const { LOCAL_OSV, OSV_URL } = config

export default async function fetchOSV({ 
    name,
    version, 
    ecosystem, 
    clientAddress
}: FetchOSVProps): Promise<FetchOSVResponse | { error: string }> {
    let response = {} as { vulnerabilities: OSVResponseVulnerability[], allow?: any[], block?: any[] }
    let osvLength = 0
    if (LOCAL_OSV === 'true') {
        const result = await run(`
            SELECT * FROM vulnerabilities
            WHERE package_name = $1
            AND ecosystem = $2
            AND (
                version_introduced = 'unknown' OR
                (
                    version_introduced ~ '^[0-9]+(\.[0-9]+)*$'
                    AND string_to_array(version_introduced, '.')::int[] 
                    <= string_to_array($3, '.')::int[]
                )
            )
            AND (
                version_fixed = 'unknown' OR
                (
                    version_fixed ~ '^[0-9]+(\.[0-9]+)*$'
                    AND string_to_array(version_fixed, '.')::int[] 
                    >= string_to_array($3, '.')::int[]
                )
            );
        `, [name, ecosystem, version])
        osvLength = result.rows.length
        response = { vulnerabilities: result.rows.map((row) => row.data) } as OSVResponse
    } else {
        try {
            if (ecosystem.toLowerCase() === 'go') {
                ecosystem = 'Go'
            }

            const res = await fetch(OSV_URL || 'https://api.osv.dev/v1/query', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ version, package: { name, ecosystem } })
            })

            if (!res.ok) {
                throw new Error(JSON.stringify(await res.text()))
            }
            const data = await res.json()
            const vulnerable = 'vulns' in data
            response = { vulnerabilities: vulnerable ? data.vulns : [] }
            osvLength = vulnerable ? data.vulns.length : 0
        } catch (error) {
            console.error(`Unable to fetch OSV ${JSON.stringify(error)}`)
            return {
                'error': `Unable to fetch OSV ${JSON.stringify(error)}`
            }
        }
    }
    const allow = await fetchList({ name, ecosystem, version, list: 'allow' })
    const block = await fetchList({ name, ecosystem, version, list: 'block' })
    if (allow.result.length) {
        response['allow'] = allow.result
    }
    if (block.result.length) {
        response['block'] = block.result
    }
    processVulnerabilities({ response, name, version, ecosystem, clientAddress })
    return { response, osvLength }
}
