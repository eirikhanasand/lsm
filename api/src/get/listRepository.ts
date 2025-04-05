import { FastifyReply, FastifyRequest } from "fastify"
import { DEFAULT_RESULTS_PER_PAGE } from "../constants.js"
import run from "../db.js"
import { loadSQL } from "../utils/loadSQL.js"

type ListRepositoryHandlerProps = {
    list: 'white' | 'black'
    req: FastifyRequest
    res: FastifyReply
}

export default async function listRepositoryHandler({req, res, list}: ListRepositoryHandlerProps) {
    const { repository } = req.params as { repository?: string }
    const { ecosystem, name, page, resultsPerPage: clientResultsPerPage, version } = req.query as ListQueryProps
    const resultsPerPage = (clientResultsPerPage || Number(DEFAULT_RESULTS_PER_PAGE) || 50)
    if (!repository) {
        return res.status(400).send({ error: "Missing repository parameter." })
    }

    try {
        const lengthQuery = await loadSQL(list === 'white' ? "fetchWhitelistLength.sql" : "fetchBlacklistLength.sql")
        const length = await run(lengthQuery, [name || null, ecosystem || null, version || null])
        const pages = Math.ceil(Number(length) / resultsPerPage)
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
            return res.send({ results: [] })
        }

        return res.send({
            page,
            pages,
            resultsPerPage,
            results: result.rows
        })
    } catch (error) {
        console.error(`Database error: ${JSON.stringify(error)}`)
        return res.status(500).send({ error: "Internal Server Error" })
    }
}
