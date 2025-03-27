import run from "../db.js"
import fetchBlacklist from "./fetchBlacklist.js"
import fetchWhiteList from "./fetchWhitelist.js"
import { processVulnerabilities } from "./download.js"

export default async function fetchOSV({name, version, ecosystem, clientAddress}: FetchOSVProps): Promise<FetchOSVResponse> {
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
    const response = { vulnerabilties: result.rows } as OSVResponse
    const whitelist = await fetchWhiteList({name, ecosystem, version})
    const blacklist = await fetchBlacklist({name, ecosystem, version})
    if (whitelist.length) {
        response['whitelist'] = whitelist
    }
    if (blacklist.length) {
        response['blacklist'] = blacklist
    }
    processVulnerabilities({response, name, version, ecosystem, clientAddress})
    return { response, osvLength: result.rows.length }
}
