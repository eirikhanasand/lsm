import { FastifyReply, FastifyRequest } from "fastify"
import run from "../db.js"

export default async function whitelistIndexHandler(_: FastifyRequest, res: FastifyReply) {
    try {
        const result = await run(`
            SELECT b.name, 
            COALESCE((SELECT array_agg(version) FROM whitelist_versions WHERE name = b.name), '{}'::TEXT[]) as versions, 
            COALESCE((SELECT array_agg(ecosystem) FROM whitelist_ecosystems WHERE name = b.name), '{}'::TEXT[]) as ecosystems, 
            COALESCE((SELECT array_agg(repository) FROM whitelist_repositories WHERE name = b.name), '{}'::TEXT[]) as repositories,
            COALESCE((SELECT array_agg(comment) FROM whitelist_comments WHERE name = b.name), '{}'::TEXT[]) as comments
            FROM whitelist b;
        `, [])
        if (result.rows.length === 0) {
            return res.send([])
        }

        return res.send(result.rows)
    } catch (error) {
        console.error("Database error:", error)
        return res.status(500).send({ error: "Internal Server Error" })
    }
}

export async function whitelistHandler(req: FastifyRequest, res: FastifyReply) {
    const { ecosystem, name, version } = req.params as OSVHandlerParams

    if (!ecosystem || !name || !version) {
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
