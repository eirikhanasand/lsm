import { FastifyReply, FastifyRequest } from "fastify"
import run from "../db.js"

export default async function postWorkerLogsHandler(req: FastifyRequest, res: FastifyReply) {
    const { log_message, worker_name } = req.body as { log_message?: string, worker_name?: string }

    if (!log_message || !worker_name) {
        return res.status(400).send({ error: "Missing log_message or worker_name." })
    }

    try {
        console.log(`Received worker log: worker_name=${worker_name}, log_message=${log_message}`)

        await run(
            `INSERT INTO worker_logs (log_message, worker_name) 
             VALUES ($1, $2)`,
            [log_message, worker_name]
        )

        return res.send({ message: "Worker log saved successfully." })
    } catch (error) {
        console.error("Database error:", error)
        return res.status(500).send({ error: "Internal Server Error" })
    }
}
