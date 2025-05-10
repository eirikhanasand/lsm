import run from '../db.js'
import fetchList from './list/fetchList.js'
import { processVulnerabilities } from './download.js'
import config from '../constants.js'
import { loadSQL } from './loadSQL.js'

const { LOCAL_OSV, OSV_URL } = config

/**
 * Fetches OSV using the name, version, ecosystem and optionally `clientAddress`
 * if using the local database. Checks whether to use the local or remote
 * database based on whether the `LOCAL_OSV` environment variable is `true` or
 * `false`.
 * 
 * @param name Package name
 * @param version Package version
 * @param ecosystem Package ecosystem
 * @param clientAddress Client IP
 * 
 * @returns The response from OSV, and how many results were found, as an object
 * with `response` and `osvLength` parameters. Optionally returns an object with
 * only the `error` parameter if the request was unsuccessful (OSV down / 
 * database unavailable).
 */
export default async function fetchOSV({
    name,
    version,
    ecosystem,
    clientAddress
}: FetchOSVProps): Promise<FetchOSVResponse | { error: string }> {
    let response = {} as { vulnerabilities: OSVResponseVulnerability[], allow?: any[], block?: any[] }
    let osvLength = 0
    if (LOCAL_OSV === 'true') {
        const query = (await loadSQL('fetchOSV.sql'))
        const result = await run(query, [name, ecosystem, version])
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
            return { error: `Unable to fetch OSV ${JSON.stringify(error)}` }
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
