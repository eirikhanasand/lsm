import run from "../db.js"
import fetchWhiteList from "../utils/fetchWhitelist.js"
import fetchBlackList from "../utils/fetchBlacklist.js"
import { FastifyReply, FastifyRequest } from "fastify"
import { processVulnerabilities } from "../utils/download.js"

type OSVResponse = {
    vulnerabilties: any[]
    whitelist?: any[]
    blacklist?: any[]
}

export default async function osvHandler(req: FastifyRequest, res: FastifyReply) {
    const { name, version, ecosystem } = req.params as OSVHandlerParams

    if (!name || !version || !ecosystem) {
        return res.status(400).send({ error: "Missing name, version, or ecosystem." })
    }

    try {
        console.log(`Fetching vulnerabilities: name=${name}, version=${version}, ecosystem=${ecosystem}`)

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
        const response = {
            vulnerabilties: result.rows
        } as OSVResponse

        const whitelist = await fetchWhiteList({name, ecosystem, version})
        const blacklist = await fetchBlackList({name, ecosystem, version})
        if (whitelist.length) {
            response['whitelist'] = whitelist
        }
        if (blacklist.length) {
            response['blacklist'] = blacklist
        }

        if ((result.rows.length === 0 || !result.rows.length) && (!('whitelist' in response) && !('blacklist' in response))) {
            return res.send({})
        }
        processVulnerabilities(response)

        return res.send(response)
    } catch (error) {
        console.error("Database error:", error)
        return res.status(500).send({ error: "Internal Server Error" })
    }
}
