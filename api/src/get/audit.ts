import { FastifyReply, FastifyRequest } from "fastify"
import run from "../db.js"

type AuditResponse = {
    id: number
    event: string
    author: string
}

export default async function auditHandler(_: FastifyRequest, res: FastifyReply) {
    try {
        console.log(`Fetching audit log`)
        const auditResult = await run(`SELECT id, event, author, timestamp FROM audit_log`, [])
        const auditLog: AuditResponse[] = await Promise.all(auditResult.rows.map(async(row) => {
            const details = await getDetails(row.author)
            return {
                id: row.id,
                event: row.event,
                author: row.author,
                name: details.name,
                image: details.image,
                timestamp: row.timestamp
            }
        }))

        return res.send(auditLog)
    } catch (error) {
        console.error("Database error:", error)
        return res.status(500).send({ error: "Internal Server Error" })
    }
}

async function getDetails(id: string): Promise<{ name: string, image: string }> {
    const details = await run(`SELECT name, image FROM users WHERE id = $1`, [id])
    return details.rows[0]
}
