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
            COALESCE((SELECT array_agg(comment) FROM blacklist_comments WHERE name = b.name), '{}'::TEXT[]) as comments 
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
    const { repository } = req.query as { repository?: string };
  
    if (!repository) {
      return res.status(400).send({ error: "Missing 'repository' query parameter." });
    }
  
    try {
      console.log(`Fetching blacklist data for repository: ${repository}`);
  
      const result = await run(
        `
        SELECT b.name,
               COALESCE(
                 (SELECT array_agg(version)
                  FROM blacklist_versions
                  WHERE name = b.name), '{}'::TEXT[]
               ) as versions,
               COALESCE(
                 (SELECT array_agg(ecosystem)
                  FROM blacklist_ecosystems
                  WHERE name = b.name), '{}'::TEXT[]
               ) as ecosystems,
               COALESCE(
                 (SELECT array_agg(repository)
                  FROM blacklist_repositories
                  WHERE name = b.name), '{}'::TEXT[]
               ) as repositories,
               COALESCE(
                 (SELECT array_agg(comment)
                  FROM blacklist_comments
                  WHERE name = b.name), '{}'::TEXT[]
               ) as comments
        FROM blacklist b
        JOIN blacklist_repositories br ON b.name = br.name
        WHERE br.repository = $1;
        `,
        [repository]
      );
  
      if (result.rows.length === 0) {
        return res.status(404).send({ error: `No blacklist entries found for repository: ${repository}` });
      }
  
      return res.send(result.rows);
    } catch (error) {
      console.error("Database error:", error);
      return res.status(500).send({ error: "Internal Server Error" });
    }
}
