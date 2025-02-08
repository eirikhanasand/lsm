import { FastifyReply, FastifyRequest } from "fastify"
import { run } from "../db.js"

type BlacklistEntry = {
    name: string
    version: string
    ecosystem: string
}

export default async function blacklistPostHandler(req: FastifyRequest<{ Body: BlacklistEntry }>, res: FastifyReply) {
    const { name, version, ecosystem } = req.body

    if (!name || !version || !ecosystem) {
        return res.status(400).send({ error: "Missing name, version, or ecosystem." })
    }

    try {
        await run(
            `
            INSERT INTO blacklist (name, version, ecosystem)
            VALUES ($1, $2, $3)
            ON CONFLICT (name, version, ecosystem) DO NOTHING
            `, 
            [name, version, ecosystem]
        )

        return res.status(201).send({ message: "Added to blacklist successfully." })
    } catch (error) {
        console.error("Database error:", error)
        return res.status(500).send({ error: "Internal Server Error" })
    }
}
