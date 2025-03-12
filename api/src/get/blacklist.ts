import { FastifyReply, FastifyRequest } from "fastify"
import run from "../db.js"
import fetchBlackList from "../utils/fetchBlacklist.js"
import { loadSQL } from "../utils/loadSQL.js"

export default async function blacklistIndexHandler(_: FastifyRequest, res: FastifyReply) {
    try {
        const query = await loadSQL("get_blacklist.sql")
        const result = await run(query, [])
        if (result.rows.length === 0) {
            return res.send([])
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
        return fetchBlackList({name, version, ecosystem, res})
    } catch (error) {
        console.error("Database error:", error)
        return res.status(500).send({ error: "Internal Server Error" })
    }
}

export async function blacklistByRepositoryHandler(req: FastifyRequest, res: FastifyReply) {
    const { repository } = req.params as { repository?: string }
    if (!repository) {
        return res.status(400).send({ error: "Missing repository parameter." })
    }
  
    try {
        console.log(`Fetching blacklist data for repository: ${repository}`);
        const query = await loadSQL("get_blacklist_by_repository.sql")
        const result = await run(query, [repository])
        if (result.rows.length === 0) {
            console.warn(`No blacklist entries found for repository: ${repository}`)
            return res.send([])
        }
        
        return res.send(result.rows)
    } catch (error) {
        console.error("Database error:", error)
        return res.status(500).send({ error: "Internal Server Error" })
    }
}
