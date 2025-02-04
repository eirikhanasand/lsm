import { FastifyReply, FastifyRequest } from "fastify"
import { Client } from "pg"
import versionAffected from "../../utils/version.js"

const dbConfig = {
    user: "osvuser",
    host: "postgres", 
    database: "osvdb",
    password: "osvpassword",
    port: 5432
}


export default async function osvHandler(req: FastifyRequest, res: FastifyReply) {
    const { name, version, ecosystem } = req.params as { name: string, version: string, ecosystem: string }

    if (!name || !version || !ecosystem) {
        return res.status(400).send({ error: "Missing name, version, or ecosystem." })
    }

    const client = new Client(dbConfig)
    await client.connect()

    try {
        const query = `
            SELECT data FROM vulnerabilities 
            WHERE ecosystem = $1 AND name = $2
        `
        const result = await client.query(query, [ecosystem, name])

        if (result.rows.length === 0) {
            return res.status(404).send({})
        }

        const vulnerabilities = result.rows.map(row => row.data)
        const filteredVulnerabilities = vulnerabilities.filter(vuln => versionAffected(version, ecosystem, vuln))

        return res.send(filteredVulnerabilities.length ? filteredVulnerabilities : {})
    } catch (error) {
        console.error("Database error:", error)
        return res.status(500).send({ error: "Internal Server Error" })
    } finally {
        await client.end()
    }
}
