import { FastifyReply, FastifyRequest } from "fastify"
import { DEFAULT_RESULTS_PER_PAGE } from "../constants.js"
import run from "../db.js"
import { loadSQL } from "../utils/loadSQL.js"

type IndexListHandlerProps = {
    list: 'white' | 'black'
    req: FastifyRequest
    res: FastifyReply
}

export default async function indexListHandler({req, res, list}: IndexListHandlerProps) {
    const { ecosystem, name, page, resultsPerPage: clientResultsPerPage, version } = req.query as ListQueryProps
    const resultsPerPage = (clientResultsPerPage || Number(DEFAULT_RESULTS_PER_PAGE) || 50)
    try {
        const query = await loadSQL(list === 'white' ? "getWhitelist.sql" : "getBlacklist.sql")
        const result = await run(query, [
            page || '1',
            String(resultsPerPage || Number(DEFAULT_RESULTS_PER_PAGE) || 50), 
            name || null, 
            ecosystem || null, 
            version || null,
            resultsPerPage,
            Number(page) || 1
        ])
        const pages = Math.ceil((result.rowCount || 1) / resultsPerPage)
        if ((Number(page) || 1) > pages) {
            console.error(`Page does not exist (${page} / ${pages})`)
            return res.send({
                page,
                pages,
                resultsPerPage,
                error: `Page does not exist (${page} / ${pages})`,
                results: []
            })
        }

        if (result.rows.length === 0) {
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
