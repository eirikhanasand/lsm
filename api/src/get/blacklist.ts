import { FastifyReply, FastifyRequest } from "fastify"
import run from "../db.js"
import fetchBlackList from "../utils/fetchBlacklist.js"

export default async function blacklistIndexHandler(_: FastifyRequest, res: FastifyReply) {
    try {
        const result = await run(`
            SELECT b.name, 
            COALESCE((SELECT array_agg(version) FROM blacklist_versions WHERE name = b.name), '{}'::TEXT[]) as versions, 
            COALESCE((SELECT array_agg(ecosystem) FROM blacklist_ecosystems WHERE name = b.name), '{}'::TEXT[]) as ecosystems, 
            COALESCE((SELECT array_agg(repository) FROM blacklist_repositories WHERE name = b.name), '{}'::TEXT[]) as repositories, 
            COALESCE((SELECT array_agg(comment) FROM blacklist_comments WHERE name = b.name), '{}'::TEXT[]) as comments,
            COALESCE((SELECT array_agg(author) FROM blacklist_authors WHERE name = b.name), '{}'::TEXT[]) as authors,
            COALESCE((SELECT timestamp FROM blacklist_createdat WHERE name = w.name), NULL) as createdat,
            COALESCE((SELECT createdby FROM blacklist_createdby WHERE name = w.name), '') as createdby,
            COALESCE((SELECT timestamp FROM blacklist_updatedat WHERE name = w.name), NULL) as updatedat,
            COALESCE((SELECT updatedby FROM blacklist_updatedby WHERE name = w.name), '') as updatedby,
            COALESCE((
                SELECT jsonb_agg(
                    jsonb_build_object(
                        'id', id,
                        'name', name,
                        'event', event,
                        'author', author,
                        'timestamp', timestamp
                    )
                )
                FROM blacklist_changelog
                WHERE name = w.name
            ), '[]'::jsonb) as changeLog
            FROM blacklist b;
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
        console.log(`Fetching blacklist data for repository: ${repository}`)
    
        const result = await run(
            `
            WITH repo_blacklist AS (
                SELECT 
                    b.name,
                    COALESCE((SELECT array_agg(version) FROM blacklist_versions WHERE name = b.name), '{}'::TEXT[]) as versions,
                    COALESCE((SELECT array_agg(ecosystem) FROM blacklist_ecosystems WHERE name = b.name), '{}'::TEXT[]) as ecosystems,
                    COALESCE((SELECT array_agg(repository) FROM blacklist_repositories WHERE name = b.name), '{}'::TEXT[]) as repositories,
                    COALESCE((SELECT array_agg(comment) FROM blacklist_comments WHERE name = b.name), '{}'::TEXT[]) as comments,
                    COALESCE((SELECT array_agg(author) FROM blacklist_authors WHERE name = b.name), '{}'::TEXT[]) as authors,
                    COALESCE((SELECT timestamp FROM blacklist_createdat WHERE name = w.name), NULL) as createdat,
                    COALESCE((SELECT createdby FROM blacklist_createdby WHERE name = w.name), '') as createdby,
                    COALESCE((SELECT timestamp FROM blacklist_updatedat WHERE name = w.name), NULL) as updatedat,
                    COALESCE((SELECT updatedby FROM blacklist_updatedby WHERE name = w.name), '') as updatedby,
                    COALESCE((
                        SELECT jsonb_agg(
                            jsonb_build_object(
                                'id', id,
                                'name', name,
                                'event', event,
                                'author', author,
                                'timestamp', timestamp
                            )
                        )
                        FROM blacklist_changelog
                        WHERE name = w.name
                    ), '[]'::jsonb) as changeLog
                FROM blacklist b
                JOIN blacklist_repositories br ON b.name = br.name
                WHERE br.repository = $1
            ),
            global_blacklist AS (
                SELECT 
                    b.name,
                    COALESCE((SELECT array_agg(version) FROM blacklist_versions WHERE name = b.name), '{}'::TEXT[]) as versions,
                    '{}'::TEXT[] as ecosystems,
                    '{}'::TEXT[] as repositories,
                    COALESCE((SELECT array_agg(comment) FROM blacklist_comments WHERE name = b.name), '{}'::TEXT[]) as comments,
                    COALESCE((SELECT array_agg(author) FROM blacklist_authors WHERE name = b.name), '{}'::TEXT[]) as authors,
                    COALESCE((SELECT array_agg(timestamp) FROM blacklist_createdat WHERE name = w.name), '{}'::TIMESTAMP) as createdat,
                    COALESCE((SELECT timestamp FROM blacklist_createdat WHERE name = w.name), NULL) as createdat,
                    COALESCE((SELECT createdby FROM blacklist_createdby WHERE name = w.name), '') as createdby,
                    COALESCE((SELECT timestamp FROM blacklist_updatedat WHERE name = w.name), NULL) as updatedat,
                    COALESCE((SELECT updatedby FROM blacklist_updatedby WHERE name = w.name), '') as updatedby,
                    COALESCE((
                        SELECT jsonb_agg(
                            jsonb_build_object(
                                'id', id,
                                'name', name,
                                'event', event,
                                'author', author,
                                'timestamp', timestamp
                            )
                        )
                        FROM blacklist_changelog
                        WHERE name = w.name
                    ), '[]'::jsonb) as changeLog
                FROM blacklist b
                LEFT JOIN blacklist_repositories br ON b.name = br.name
                WHERE br.repository IS NULL OR br.repository = ''
            )
            SELECT * FROM repo_blacklist
            UNION ALL
            SELECT * FROM global_blacklist;
            `,
            [repository]
        )
    
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
