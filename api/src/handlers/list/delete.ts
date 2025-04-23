import { FastifyReply, FastifyRequest } from "fastify"
import { runInTransaction } from "../../db.js"

export default async function listDeleteHandler(req: FastifyRequest, res: FastifyReply) {
    const { name, list } = req.params as { name: string, list: string }
    if (!name) {
        return res.status(400).send({ error: "Missing name parameter." })
    }

    try {
        await runInTransaction(async (client) => {
            await client.query(`DELETE FROM ${list}list_versions WHERE name = $1;`, [name])
            await client.query(`DELETE FROM ${list}list_ecosystems WHERE name = $1;`, [name])
            await client.query(`DELETE FROM ${list}list_repositories WHERE name = $1;`, [name])
            await client.query(`DELETE FROM ${list}list_references WHERE name = $1;`, [name])
            await client.query(`DELETE FROM ${list}list_authors WHERE name = $1;`, [name])
            await client.query(`DELETE FROM ${list}list_created WHERE name = $1;`, [name])
            await client.query(`DELETE FROM ${list}list_updated WHERE name = $1;`, [name])
            await client.query(`DELETE FROM ${list}list_changelog WHERE name = $1;`, [name])

            const mainDeleteResult = await client.query(`DELETE FROM ${list}list WHERE name = $1 RETURNING *;`, [name])
            if (mainDeleteResult.rowCount === 0) {
                throw new Error(`No ${list}list entry found for name='${name}'.`)
            }
            return
        })
        return res.send({
            message: `All ${list}list entries for '${name}' deleted successfully.`,
        })
    } catch (error: any) {
        if (error.message.includes("No entry found for name")) {
            return res.status(404).send({ error: error.message })
        }

        console.error(`Database error: ${JSON.stringify(error)}`)
        return res.status(500).send({ error: "Internal Server Error" })
    }
}
