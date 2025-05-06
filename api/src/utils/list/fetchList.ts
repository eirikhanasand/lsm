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
    list: 'allow' | 'block'
    res?: FastifyReply
    page?: number
    resultsPerPage?: number
    startDate?: string
    endDate?: string
    search?: string
}

export default async function fetchList({
    ecosystem,
    name,
    version,
    repository,
    list,
    page: Page,
    resultsPerPage: ResultsPerPage,
    startDate,
    endDate,
    res,
    search
}: FetchListProps) {
    const page = Page || 1
    const resultsPerPage = ResultsPerPage || Number(DEFAULT_RESULTS_PER_PAGE) || 50
    console.log(
        `Fetching ${list} entry:` +
        ` ecosystem=${ecosystem},` +
        ` name=${name},` +
        ` version=${version},` +
        ` repository=${repository},` +
        ` startDate=${startDate},` +
        ` endDate=${endDate},` +
        ` page=${page ? page : 'undefined (Fallback: 1)'},` +
        ` resultsPerPage=${resultsPerPage 
            ? resultsPerPage 
            : `undefined (Fallback: ${DEFAULT_RESULTS_PER_PAGE})`},` +
        ` search=${search}`
    )

    const query = (await loadSQL('list.sql')).replaceAll('{list}', list)
    const logCountQuery = (await loadSQL('listCount.sql')).replaceAll('{list}', list)
    const result = await run(query, [
        name || null,
        ecosystem || null,
        version || null,
        repository || null,
        startDate || null,
        endDate || null,
        page || 1,
        resultsPerPage,
        search || null
    ])
    const count = await run(logCountQuery, [
        name || null,
        ecosystem || null,
        version || null,
        repository || null,
        startDate || null,
        endDate || null,
        search || null
    ])
    const pages = Math.ceil((Number(count.rows[0].count) || 1) / resultsPerPage)

    const response = {
        page,
        pages,
        resultsPerPage,
        result: result.rows
    }

    return res
        ? res.send(response)
        : response
}

