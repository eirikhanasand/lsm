import { FastifyReply, FastifyRequest } from "fastify"
import versionAffected from "../../utils/version.js"
import run from "../db.js"

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
