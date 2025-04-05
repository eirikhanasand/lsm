import { FastifyReply } from "fastify"
import run from "../../db.js"
import { loadSQL } from "../loadSQL.js"
import { DEFAULT_RESULTS_PER_PAGE } from "../../constants.js"

type FetchListProps = {
    repository?: string
    name?: string
    version?: string
    ecosystem?: string
    list: 'white' | 'black'
    res?: FastifyReply
    page?: number
    resultsPerPage?: number
}

export default async function fetchList({ 
    ecosystem, 
    name, 
    version, 
    repository, 
    list, 
    page, 
    resultsPerPage,
    res, 
}: FetchListProps) {
    console.log(`Fetching ${list}list entry: ecosystem=${ecosystem}, name=${name}, version=${version}, repository=${repository}, page=${page ? page : 'undefined (Fallback: 1)'}, resultsPerPage=${resultsPerPage ? resultsPerPage : `undefined (Fallback: ${DEFAULT_RESULTS_PER_PAGE})`}`)

    const query = await loadSQL(list === 'white' ? "fetchWhitelist.sql" : "fetchBlacklist.sql")
    const result = await run(query, [
        name || null, 
        ecosystem || null, 
        version || null,
        repository || null,
        page || '1',
        String(resultsPerPage || DEFAULT_RESULTS_PER_PAGE || 50)
    ])
    if (result.rows.length === 0) {
        return res 
            ? res.status(404).send({ error: `${list}list entry not found.` })
            : []
    }

    return res 
        ? res.send(result.rows)
        : result.rows
}
