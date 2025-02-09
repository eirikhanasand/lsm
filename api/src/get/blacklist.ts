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
        console.log(`Fetching blacklist entry: name=${name}, version=${version}, ecosystem=${ecosystem}`)

        const result = await run(
            `SELECT b.name, bv.version, be.ecosystem 
             FROM blacklist b
             LEFT JOIN blacklist_versions bv ON b.name = bv.name
             LEFT JOIN blacklist_ecosystems be ON b.name = be.name
             WHERE b.name = $1 AND bv.version = $2 AND be.ecosystem = $3;`,
            [name, version, ecosystem]
        )

        if (result.rows.length === 0) {
            return res.status(404).send({ error: "Blacklist entry not found." })
        }

        return res.send(result.rows[0])
    } catch (error) {
        console.error("Database error:", error)
        return res.status(500).send({ error: "Internal Server Error" })
    }
}
