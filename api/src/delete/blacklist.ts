import { FastifyReply, FastifyRequest } from "fastify"
import { runInTransaction } from "../db.js"

export default async function blacklistDeleteHandler(req: FastifyRequest, res: FastifyReply) {
    const { name } = req.params as { name: string }
    if (!name) {
        return res.status(400).send({ error: "Missing name parameter." })
    }

    try {
        await runInTransaction(async (client) => {
            await client.query("DELETE FROM blacklist_versions WHERE name = $1;", [name])
            await client.query("DELETE FROM blacklist_ecosystems WHERE name = $1;", [name])
            await client.query("DELETE FROM blacklist_repositories WHERE name = $1;", [name])
            await client.query("DELETE FROM blacklist_comments WHERE name = $1;", [name])

            const mainDeleteResult = await client.query(
                "DELETE FROM blacklist WHERE name = $1 RETURNING *;",
                [name]
            )
            if (mainDeleteResult.rowCount === 0) {
                throw new Error(`No blacklist entry found for name='${name}'.`)
            }
            return
        })
        return res.send({
            message: `All blacklist entries for '${name}' deleted successfully.`,
        })
    } catch (error: any) {
        if (error.message.includes("No entry found for name")) {
            return res.status(404).send({ error: error.message })
        }

        console.error("Database error:", error)
        return res.status(500).send({ error: "Internal Server Error" })
    }
}
