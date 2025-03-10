import { FastifyReply, FastifyRequest } from "fastify"
import run from "../db.js"
import fetchWhiteList from "../utils/fetchWhitelist.js"

export default async function whitelistIndexHandler(_: FastifyRequest, res: FastifyReply) {
    try {
        const result = await run(`
            SELECT w.name, 
            COALESCE((SELECT array_agg(version) FROM whitelist_versions WHERE name = w.name), '{}'::TEXT[]) as versions, 
            COALESCE((SELECT array_agg(ecosystem) FROM whitelist_ecosystems WHERE name = w.name), '{}'::TEXT[]) as ecosystems, 
            COALESCE((SELECT array_agg(repository) FROM whitelist_repositories WHERE name = w.name), '{}'::TEXT[]) as repositories,
            COALESCE((SELECT array_agg(comment) FROM whitelist_comments WHERE name = w.name), '{}'::TEXT[]) as comments
            FROM whitelist w;
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
        return fetchWhiteList({name, version, ecosystem, res})
    } catch (error) {
        console.error("Database error:", error)
        return res.status(500).send({ error: "Internal Server Error" })
    }
}

export async function whitelistByRepositoryHandler(req: FastifyRequest, res: FastifyReply) {
    const { repository } = req.params as { repository?: string }
    if (!repository) {
        return res.status(400).send({ error: "Missing repository parameter." })
    }
  
    try {
        console.log(`Fetching whitelist data for repository: ${repository}`);
    
        const result = await run(
            `
            WITH repo_whitelist AS (
                SELECT 
                    w.name,
                    COALESCE((SELECT array_agg(version) FROM whitelist_versions WHERE name = w.name), '{}'::TEXT[]) as versions,
                    COALESCE((SELECT array_agg(ecosystem) FROM whitelist_ecosystems WHERE name = w.name), '{}'::TEXT[]) as ecosystems,
                    COALESCE((SELECT array_agg(repository) FROM whitelist_repositories WHERE name = w.name), '{}'::TEXT[]) as repositories,
                    COALESCE((SELECT array_agg(comment) FROM whitelist_comments WHERE name = w.name), '{}'::TEXT[]) as comments
                FROM whitelist w
                JOIN whitelist_repositories wr ON w.name = wr.name
                WHERE wr.repository = $1
            ),
            global_whitelist AS (
                SELECT 
                    w.name,
                    COALESCE((SELECT array_agg(version) FROM whitelist_versions WHERE name = w.name), '{}'::TEXT[]) as versions,
                    '{}'::TEXT[] as ecosystems,
                    '{}'::TEXT[] as repositories,
                    COALESCE((SELECT array_agg(comment) FROM whitelist_comments WHERE name = w.name), '{}'::TEXT[]) as comments
                FROM whitelist w
                LEFT JOIN whitelist_repositories wr ON w.name = wr.name
                WHERE wr.repository IS NULL OR wr.repository = ''
            )
            SELECT * FROM repo_whitelist
            UNION ALL
            SELECT * FROM global_whitelist;
            `,
            [repository]
        )
    
        if (result.rows.length === 0) {
          console.warn(`No whitelist entries found for repository: ${repository}`)
          return res.send([])
        }
        
        return res.send(result.rows)
    } catch (error) {
        console.error("Database error:", error)
        return res.status(500).send({ error: "Internal Server Error" })
    }
}
