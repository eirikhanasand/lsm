import { FastifyReply, FastifyRequest } from 'fastify'
import run from '../../db.js'
import { loadSQL } from '../../utils/loadSQL.js'
import config from '../../constants.js'

const { DEFAULT_RESULTS_PER_PAGE } = config

type StatisticHandlerParams = {
    startTime: string
    endTime: string
    page: string
    resultsPerPage: string
}

type StatisticResponse = {
    totalScanned: number
    vulnerabilitiesFound: number
    criticalBlocked: number
    safeApproved: number
    lastScan: string | null
    vulnerabilitiesOverTime: Vulnerability[]
    page: number
    pages: number
    resultsPerPage: number
}

/**
 * Fetches package statistics for the application. 
 * 
 * Includes data such as `totalScanned`, `vulnerabilitiesFound`, 
 * `criticalBlocked`, `safeApproved`, `lastScan`, `vulnerabilitiesOverTime`, 
 * `page`, `pages`, `resultsPerPage`
 * 
 * Optional query parameters: `startTime`, `endTime`, `page`, `resultsPerPage`
 * 
 * @param req Incoming Fastify Request
 * @param res Outgoing Fastify Response
 * 
 * @returns Fastify Response
 */
export default async function packageStatisticsHandler(req: FastifyRequest, res: FastifyReply) {
    const { startTime, endTime, page: Page, resultsPerPage: ResultsPerPage } = req.query as StatisticHandlerParams
    const start = startTime || new Date(new Date().setFullYear(new Date().getFullYear() - 1)).toISOString()
    const end = endTime || new Date().toISOString()
    const page = Number(Page) || 1
    const resultsPerPage = Number(ResultsPerPage) || Number(DEFAULT_RESULTS_PER_PAGE) || 50

    if (!isValidDate(start) || !isValidDate(end)) {
        return res.status(400).send({ error: "startTime or endTime is not a valid date" })
    }

    try {
        console.log(`Fetching package stats: start=${start}, end=${end}, page=${page}, resultsPerPage=${resultsPerPage}`)

        // Fetches overall summary stats
        const summaryQuery = await loadSQL('statisticsSummary.sql')
        const summaryResult = await run(summaryQuery, [start, end])
        const summary = summaryResult.rows[0]

        // Fetches vulnerability severity over time (vulnerabilities per timestamp)
        const severityQuery = await loadSQL('statistics.sql')
        const severityResult = await run(severityQuery, [
            start,
            end,
            page || 1,
            resultsPerPage || Number(DEFAULT_RESULTS_PER_PAGE) || 50
        ])

        // Formats the results and adds paging info to the response
        const pages = Math.ceil((Number(summary.total_scanned) || 1) / resultsPerPage)
        const response: StatisticResponse = {
            totalScanned: summary.total_scanned,
            vulnerabilitiesFound: summary.vulnerabilities_found,
            criticalBlocked: summary.vulnerabilities_found,
            safeApproved: summary.safe_approved,
            lastScan: summary.last_scan || null,
            vulnerabilitiesOverTime: severityResult.rows,
            page,
            pages,
            resultsPerPage
        }

        return res.send(response)
    } catch (error) {
        console.error(`Database error: ${JSON.stringify(error)}`)
        return res.status(500).send({ error: 'Internal Server Error' })
    }
}

/**
 * Checks if a date string is valid.
 * 
 * @param date `Date` object as a string
 * 
 * @returns `true`/`false` depending on whether the date is valid.
 */
function isValidDate(date: string): boolean {
    return !isNaN(new Date(date).getTime())
}
