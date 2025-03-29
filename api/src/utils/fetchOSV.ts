import run from "../db.js"
import fetchBlacklist from "./fetchBlacklist.js"
import fetchWhiteList from "./fetchWhitelist.js"
import { processVulnerabilities } from "./download.js"
import { LOCAL_OSV, OSV_URL } from "../constants.js"

export default async function fetchOSV({name, version, ecosystem, clientAddress}: FetchOSVProps): Promise<FetchOSVResponse | {error: string}> {
    let response = {} as { vulnerabilties: any[], whitelist?: any[], blacklist?: any[] }
    let osvLength = 0
    if (LOCAL_OSV === "true") {
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
        response = { vulnerabilties: result.rows } as OSVResponse
    } else {
        try {
            if (ecosystem.toLowerCase() === "go") {
                ecosystem = "Go"
            }

            const res = await fetch(OSV_URL || "https://api.osv.dev/v1/query", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ version,package: { name, ecosystem } })
            })

            if (!res.ok) {
                throw new Error(JSON.stringify(res))
            }
            const data = await res.json()
            response = { vulnerabilties: data.vulns }
            osvLength = data.vulns.length
        } catch (error) {
            console.error(`Unable to fetch OSV ${JSON.stringify(error)}`)
            return {
                "error": `Unable to fetch OSV ${JSON.stringify(error)}`
            }
        }
    }
    const whitelist = await fetchWhiteList({name, ecosystem, version})
    const blacklist = await fetchBlacklist({name, ecosystem, version})
    if (whitelist.length) {
        response['whitelist'] = whitelist
    }
    if (blacklist.length) {
        response['blacklist'] = blacklist
    }
    processVulnerabilities({response, name, version, ecosystem, clientAddress})
    return { response, osvLength }
}
