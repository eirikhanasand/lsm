import { FastifyReply, FastifyRequest } from "fastify"
import run from "../db.js"

type StatisticHandlerParams = {
    startTime: string
    endTime: string
}

type StatisticResponse = {
    totalScanned: number
    vulnerabilitiesFound: number
    criticalBlocked: number
    safeApproved: number
    lastScan: string | null
    vulnerabilitiesOverTime: Vulnerability[]
}

export default async function packageStatsHandler(req: FastifyRequest, res: FastifyReply) {
    const { startTime, endTime } = req.query as StatisticHandlerParams
    if (!startTime || !endTime) {
        return res.status(400).send({ error: "Missing start or end time." })
    }

    const queryParams =  [startTime, endTime]

    try {
        console.log(`Fetching package stats: start=${startTime}, end=${endTime}`)

         // Fetching overall summary stats
        const summaryResult = await run(`
            SELECT 
                COUNT(*) AS total_scanned,
                COUNT(*) FILTER (WHERE status = 1) AS safe_approved,
                COUNT(*) FILTER (WHERE status = 2) AS vulnerabilities_found,
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
            timestamp: row.timestamp,
            package_name: row.package_name,
            repository: row.repository,
            ecosystem: row.ecosystem,
            status: row.status,
            reason: row.reason,
            severity: row.severity,
        }))

        const response: StatisticResponse = {
            totalScanned: summary.total_scanned,
            vulnerabilitiesFound: summary.vulnerabilities_found,
            criticalBlocked: summary.vulnerabilities_found,
            safeApproved: summary.safe_approved,
            lastScan: summary.last_scan || null,
            vulnerabilitiesOverTime
        }

        return res.send(response)
    } catch (error) {
        console.error(`Database error: ${JSON.stringify(error)}`)
        return res.status(500).send({ error: "Internal Server Error" })
    }
}
