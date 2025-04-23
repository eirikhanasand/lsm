import { FastifyReply } from 'fastify'
import run from '../../db.js'
import { loadSQL } from '../loadSQL.js'
import config from '../../constants.js'

const { DEFAULT_RESULTS_PER_PAGE } = config

type FetchListProps = {
    repository?: string
    name?: string
    version?: string
    ecosystem?: string
    list: 'white' | 'black'
    res?: FastifyReply
    page?: number
    resultsPerPage?: number
    startDate?: string
    endDate?: string
}

export default async function fetchList({
    ecosystem,
    name,
    version,
    repository,
    list,
    page,
    resultsPerPage,
    startDate,
    endDate,
    res,
}: FetchListProps) {
    console.log(
        `Fetching ${list}list entry:` +
        ` ecosystem=${ecosystem},` +
        ` name=${name},` +
        ` version=${version},` +
        ` repository=${repository},` +
        ` startDate=${startDate},` +
        ` endDate=${endDate},` +
        ` page=${page ? page : 'undefined (Fallback: 1)'},` +
        ` resultsPerPage=${resultsPerPage 
            ? resultsPerPage 
            : `undefined (Fallback: ${DEFAULT_RESULTS_PER_PAGE})`}
        `
    )

    const query = (await loadSQL('getList.sql')).replaceAll('{list}', list)
    const result = await run(query, [
        name || null,
        ecosystem || null,
        version || null,
        repository || null,
        startDate || null,
        endDate || null,
        page || 1,
        resultsPerPage || Number(DEFAULT_RESULTS_PER_PAGE) || 50
    ])

    return res
        ? res.send(result.rows)
        : result.rows
}
