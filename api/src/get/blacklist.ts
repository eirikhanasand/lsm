import { FastifyReply, FastifyRequest } from "fastify"
import run from "../db.js"

export default async function blacklistIndexHandler(_: FastifyRequest, res: FastifyReply) {
    try {
        const result = await run(`
            SELECT b.name, 
            COALESCE((SELECT array_agg(version) FROM blacklist_versions WHERE name = b.name), '{}'::TEXT[]) as versions, 
            COALESCE((SELECT array_agg(ecosystem) FROM blacklist_ecosystems WHERE name = b.name), '{}'::TEXT[]) as ecosystems, 
            COALESCE((SELECT array_agg(repository) FROM blacklist_repositories WHERE name = b.name), '{}'::TEXT[]) as repositories, 
            COALESCE((SELECT array_agg(comment) FROM blacklist_comments WHERE name = b.name), '{}'::TEXT[]) as comments 
            FROM blacklist b;
        `, [])
        if (result.rows.length === 0) {
            return res.status(404).send({ error: "Blacklist empty." })
        }

        return res.send(result.rows)
    } catch (error) {
        console.error("Database error:", error)
        return res.status(500).send({ error: "Internal Server Error" })
    }
}

export async function blacklistHandler(req: FastifyRequest, res: FastifyReply) {
    const { ecosystem, name, version } = req.params as OSVHandlerParams
    if (!ecosystem || !name || !version) {
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
