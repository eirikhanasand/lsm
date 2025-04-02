import { FastifyReply, FastifyRequest } from "fastify"
import { DEFAULT_RESULTS_PER_PAGE } from "../constants"
import run from "../db"
import { loadSQL } from "../utils/loadSQL"

type IndexListHandlerProps = {
    list: 'white' | 'black'
    req: FastifyRequest
    res: FastifyReply
}

export default async function indexListHandler({req, res, list}: IndexListHandlerProps) {
    const { ecosystem, name, page, resultsPerPage, version } = req.query as IndexListQueryProps
    try {
        const query = await loadSQL(list === 'white' ? "getWhitelist.sql" : "getBlacklist.sql")
        const result = await run(query, [
            page || '1',
            String(resultsPerPage || Number(DEFAULT_RESULTS_PER_PAGE) || 50), 
            name || null, 
            ecosystem || null, 
            version || null
        ])
        if (result.rows.length === 0) {
            return res.send([])
        }

        return res.send(result.rows)
    } catch (error) {
        console.error("Database error:", error)
        return res.status(500).send({ error: "Internal Server Error" })
    }
}
