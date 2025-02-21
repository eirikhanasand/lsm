import { FastifyReply, FastifyRequest } from "fastify"
import versionAffected from "../../utils/version.js"
import run from "../db.js"
import fetchWhiteList from "../utils/fetchWhitelist.js"
import fetchBlackList from "../utils/fetchBlacklist.js"

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
            AND version_fixed = $3
        `, [name, ecosystem, version]);

        const vulnerabilities = result.rows.map(row => row.data)
        const filteredVulnerabilities = vulnerabilities.filter(vuln => versionAffected(version, ecosystem, vuln))
        const response = {
            vulnerabilties: filteredVulnerabilities
        } as OSVResponse

        const whitelist = await fetchWhiteList({name, ecosystem, version})
        const blacklist = await fetchBlackList({name, ecosystem, version})
        if (whitelist.length) {
            response['whitelist'] = whitelist
        }
        if (blacklist.length) {
            response['blacklist'] = blacklist
        }

        if ((result.rows.length === 0 || !filteredVulnerabilities.length) && (!('whitelist' in response) && !('blacklist' in response))) {
            return res.send({})
        }

        return res.send(response)
    } catch (error) {
        console.error("Database error:", error)
        return res.status(500).send({ error: "Internal Server Error" })
    }
}
