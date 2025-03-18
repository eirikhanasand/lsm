import { FastifyReply, FastifyRequest } from "fastify"
import run from "../db.js"

export default async function getWorkerLogsHandler(req: FastifyRequest, res: FastifyReply) {
    try {
        console.log("Fetching worker logs")
        const logsResult = await run(
            `SELECT id, timestamp, log_message, worker_name FROM worker_logs ORDER BY timestamp DESC`,
            []
        )
        if (!logsResult.rows.length) {
            return res.send([])
        }
        return res.send(logsResult.rows)
    } catch (error) {
        console.error("Database error:", error)
        return res.status(500).send({ error: "Internal Server Error" })
    }
}
