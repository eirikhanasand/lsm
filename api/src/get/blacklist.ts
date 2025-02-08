import { FastifyReply, FastifyRequest } from "fastify"
import versionAffected from "../../utils/version.js"
import run from "../db.js"

type OSVHandlerParams = {
    name: string
    version: string
    ecosystem: string
}

export default async function blacklistHandler(req: FastifyRequest, res: FastifyReply) {
    const { name, version, ecosystem } = req.params as OSVHandlerParams

    if (!name || !version || !ecosystem) {
        return res.status(400).send({ error: "Missing name, version, or ecosystem." })
    }

    try {
        const result = await run(`
            SELECT * FROM blacklist 
            WHERE name = $1
            AND version = $2 
            AND ecosystem = $3
        `, [name, ecosystem, version])

        if (result.rows.length === 0) {
            return res.status(404).send({})
        }

        const vulnerabilities = result.rows.map(row => row.data)
        const filteredVulnerabilities = vulnerabilities.filter(vuln => versionAffected(version, ecosystem, vuln))

        return res.send(filteredVulnerabilities.length ? filteredVulnerabilities : {})
    } catch (error) {
        console.error("Database error:", error)
        return res.status(500).send({ error: "Internal Server Error" })
    }
}
