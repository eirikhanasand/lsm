import { FastifyReply, FastifyRequest } from "fastify"
import { DEFAULT_RESULTS_PER_PAGE } from "../constants"
import run from "../db"
import { loadSQL } from "../utils/loadSQL"

type ListRepositoryHandlerProps = {
    list: 'white' | 'black'
    req: FastifyRequest
    res: FastifyReply
}

export default async function listRepositoryHandler({req, res, list}: ListRepositoryHandlerProps) {
    const { repository } = req.params as { repository?: string }
    const { ecosystem, name, page, resultsPerPage, version } = req.query as IndexListQueryProps
    
    if (!repository) {
        return res.status(400).send({ error: "Missing repository parameter." })
    }

    try {
        console.log(`Fetching ${list}list data for repository: ${repository}`)
        const query = await loadSQL(list === 'white' ? "getWhitelistByRepository.sql" : "getBlacklistByRepository.sql")
        const result = await run(query, [
            repository,
            page || '1',
            String(resultsPerPage || DEFAULT_RESULTS_PER_PAGE || 50), 
            name || null, 
            ecosystem || null, 
            version || null
        ])
        if (result.rows.length === 0) {
            console.warn(`No ${list}list entries found for repository: ${repository}`)
            return res.send([])
        }

        return res.send(result.rows)
    } catch (error) {
        console.error("Database error:", error)
        return res.status(500).send({ error: "Internal Server Error" })
    }
}
