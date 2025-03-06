import { FastifyReply, FastifyRequest } from "fastify";
import run from "../db.js";
import { format } from "date-fns";

type StatisticResponse = {
    totalScanned: number;
    vulnerabilitiesFound: number;
    criticalBlocked: number;
    safeApproved: number;
    lastScan: string;
    repositoryStats: Array<{
        repository: string;
        ecosystem: string;
        scanned: number;
        vulnerabilities: number;
        blocked: number;
        safe: number;
    }>;
    vulnerabilitiesOverTime: Array<{
        timestamp: string;
        severity: number;
        repository: string;
        ecosystem: string;
        reason: string;
    }>;
};

export default async function packageStatsHandler(req: FastifyRequest, res: FastifyReply) {
    const { timestart, timeend} = req.params as StatisticHandlerParams;

    const queryParams =  [timestart, timeend];

    try {
        console.log(`Fetching package stats: start=${timestart}, end=${timeend}`);

         // Fetching overall summary stats
        const summaryResult = await run(`
            SELECT 
                COUNT(*) AS total_scanned,
                COUNT(*) FILTER (WHERE status = 'passed') AS safe_approved,
                COUNT(*) FILTER (WHERE status = 'blocked') AS vulnerabilities_found,
                MAX(timestamp) AS last_scan
            FROM download_events
            WHERE timestamp BETWEEN $1 AND $2;
        `, queryParams);

        const summary = summaryResult.rows[0];

        // Fetching vulnerability severity over time (vulnerabilities per timestamp)
        const severityResult = await run(`
            SELECT *
            FROM download_events
            WHERE timestamp BETWEEN $1 AND $2;
        `, queryParams);

        const vulnerabilitiesOverTime = severityResult.rows.map(row => ({
            timestamp: format(new Date(row.timestamp), 'yyyy-MM-dd-hh-mm-ss'),
            repository: row.repository,
            ecosystem: row.ecosystem,
            status: row.status,
            reason: row.reason,
            severity: 10,
        }));

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
        `, queryParams);

        const repositoryStats = repositoryResult.rows.map(row => ({
            repository: row.repository,
            ecosystem: row.ecosystem,
            scanned: row.scanned,
            vulnerabilities: row.vulnerabilities,
            blocked: row.blocked,
            safe: row.safe,
        }));

        // Structure the response data
        const response: StatisticResponse = {
            totalScanned: summary.total_scanned,
            vulnerabilitiesFound: summary.vulnerabilities_found,
            criticalBlocked: summary.critical_blocked,
            safeApproved: summary.safe_approved,
            lastScan: format(new Date(summary.last_scan), 'yyyy-MM-dd'),
            repositoryStats,
            vulnerabilitiesOverTime
        };

        return res.send(response);
    } catch (error) {
        console.error("Database error:", error);
        return res.status(500).send({ error: "Internal Server Error" });
    }
}
