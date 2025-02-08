import { FastifyReply, FastifyRequest } from "fastify"
import run from "../db.js"

type WhitelistEntry = {
    name: string
    version: string
    ecosystem: string
}

export default async function whitelistPutHandler(req: FastifyRequest<{ Body: WhitelistEntry }>, res: FastifyReply) {
    const { name, version, ecosystem } = req.body

    if (!name || !version || !ecosystem) {
        return res.status(400).send({ error: "Missing name, version, or ecosystem." })
    }

    try {
        const updatedRows = await run(`
            UPDATE whitelist
            SET version = $2, ecosystem = $3
            WHERE name = $1
            RETURNING *;
        `, [name, version, ecosystem])

        if (updatedRows.rowCount === 0) {
            return res.status(404).send({ error: "Whitelist entry not found." })
        }

        return res.send({ message: "Whitelist entry updated successfully." })
    } catch (error) {
        console.error("Database error:", error)
        return res.status(500).send({ error: "Internal Server Error" })
    }
}
