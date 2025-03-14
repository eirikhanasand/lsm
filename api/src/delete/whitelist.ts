import { FastifyReply, FastifyRequest } from "fastify"
import { runInTransaction } from "../db.js"

export default async function whitelistDeleteHandler(req: FastifyRequest, res: FastifyReply) {
    const { name } = req.params as { name: string }
    if (!name) {
        return res.status(400).send({ error: "Missing name parameter." })
    }

    try {
        await runInTransaction(async (client) => {
            await client.query("DELETE FROM whitelist_versions WHERE name = $1;", [name])
            await client.query("DELETE FROM whitelist_ecosystems WHERE name = $1;", [name])
            await client.query("DELETE FROM whitelist_repositories WHERE name = $1;", [name])
            await client.query("DELETE FROM whitelist_references WHERE name = $1;", [name])
            await client.query("DELETE FROM whitelist_authors WHERE name = $1;", [name])
            await client.query("DELETE FROM whitelist_created WHERE name = $1;", [name])
            await client.query("DELETE FROM whitelist_updated WHERE name = $1;", [name])
            await client.query("DELETE FROM whitelist_changelog WHERE name = $1;", [name])

            const mainDeleteResult = await client.query("DELETE FROM whitelist WHERE name = $1 RETURNING *;", [name])
            if (mainDeleteResult.rowCount === 0) {
                throw new Error(`No whitelist entry found for name='${name}'.`)
            }
            return
        })
        return res.send({
            message: `All whitelist entries for '${name}' deleted successfully.`,
        })
    } catch (error: any) {
        if (error.message.includes("No entry found for name")) {
            return res.status(404).send({ error: error.message })
        }

        console.error("Database error:", error)
        return res.status(500).send({ error: "Internal Server Error" })
    }
}
