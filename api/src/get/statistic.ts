import { FastifyReply, FastifyRequest } from "fastify"
import run from "../db.js"

type StatisticHandlerParams = {
    timestart: string
    timeend: string
}

type StatisticResponse = {
    totalScanned: number
    vulnerabilitiesFound: number
    criticalBlocked: number
    safeApproved: number
    lastScan: string | null
    repositoryStats: Statistics[]
    vulnerabilitiesOverTime: Vulnerability[]
}

export default async function packageStatsHandler(req: FastifyRequest, res: FastifyReply) {
    const { timestart, timeend} = req.params as StatisticHandlerParams
    if (!timestart || !timeend) {
        return res.status(400).send({ error: "Missing start or end time." })
    }

    const queryParams =  [timestart, timeend]

    try {
        console.log(`Fetching package stats: start=${timestart}, end=${timeend}`)

         // Fetching overall summary stats
        const summaryResult = await run(`
            SELECT 
                COUNT(*) AS total_scanned,
                COUNT(*) FILTER (WHERE status = 'passed') AS safe_approved,
                COUNT(*) FILTER (WHERE status = 'blocked') AS vulnerabilities_found,
                MAX(timestamp) AS last_scan
            FROM download_events
            WHERE timestamp BETWEEN $1 AND $2;
        `, queryParams)

        const summary = summaryResult.rows[0]

        // Fetching vulnerability severity over time (vulnerabilities per timestamp)
        const severityResult = await run(`
            SELECT *
            FROM download_events
            WHERE timestamp BETWEEN $1 AND $2;
        `, queryParams)

        const vulnerabilitiesOverTime = severityResult.rows.map(row => ({
            timestamp: format(row.timestamp),
            package_name: row.package_name,
            repository: row.repository,
            ecosystem: row.ecosystem,
            status: row.status,
            reason: row.reason,
            severity: row.severity,
        }))

        // Fetching repository stats
        const repositoryResult = await run(`
            SELECT 
                repository,
                ecosystem,
                COUNT(*) AS scanned,
                COUNT(*) FILTER (WHERE status = 'blocked') AS blocked,
                COUNT(*) FILTER (WHERE status = 'approved') AS safe
            FROM download_events
            WHERE timestamp BETWEEN $1 AND $2
            GROUP BY repository, ecosystem;
        `, queryParams)

        const repositoryStats = repositoryResult.rows.map(row => ({
            repository: row.repository,
            ecosystem: row.ecosystem,
            scanned: row.scanned,
            vulnerabilities: row.vulnerabilities,
            blocked: row.blocked,
            safe: row.safe
        }))

        const response: StatisticResponse = {
            totalScanned: summary.total_scanned,
            vulnerabilitiesFound: summary.vulnerabilities_found,
            criticalBlocked: summary.vulnerabilities_found,
            safeApproved: summary.safe_approved,
            lastScan: summary.last_scan ? format(summary.last_scan) : null,
            repositoryStats,
            vulnerabilitiesOverTime
        }

        return res.send(response)
    } catch (error) {
        console.error("Database error:", error)
        return res.status(500).send({ error: "Internal Server Error" })
    }
}

function format(timestamp: string): string {
    console.log("the timestamp is", timestamp)
    const date = new Date(timestamp)
    const year = date.getFullYear()
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const day = date.getDate().toString().padStart(2, '0')
    const hour = date.getHours().toString().padStart(2, '0')
    const minute = date.getMinutes().toString().padStart(2, '0')

    const formatted = `${year}-${month}-${day}T${hour}:${minute}:00.000Z`

    console.log("formatted timestamp is: ", formatted)
    return formatted
}

