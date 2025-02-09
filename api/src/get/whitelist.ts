import { FastifyReply, FastifyRequest } from "fastify"
import versionAffected from "../../utils/version.js"
import run from "../db.js"

type OSVHandlerParams = {
    name: string
    version: string
    ecosystem: string
}

export default async function whitelistHandler(req: FastifyRequest, res: FastifyReply) {
    const { name, version, ecosystem } = req.params as OSVHandlerParams

    if (!name || !version || !ecosystem) {
        return res.status(400).send({ error: "Missing name, version, or ecosystem." })
    }

    try {
        console.log(`Fetching whitelist entry: name=${name}, version=${version}, ecosystem=${ecosystem}`)

        const result = await run(
            `SELECT w.name, wv.version, we.ecosystem 
             FROM whitelist w
             LEFT JOIN whitelist_versions wv ON w.name = wv.name
             LEFT JOIN whitelist_ecosystems we ON w.name = we.name
             WHERE w.name = $1 AND wv.version = $2 AND we.ecosystem = $3;`,
            [name, version, ecosystem]
        )

        if (result.rows.length === 0) {
            return res.status(404).send({ error: "Whitelist entry not found." })
        }

        return res.send(result.rows[0])
    } catch (error) {
        console.error("Database error:", error)
        return res.status(500).send({ error: "Internal Server Error" })
    }
}
