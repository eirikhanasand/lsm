import { FastifyReply, FastifyRequest } from "fastify"
import run from "../db.js"

type WhitelistParams = {
    name: string
}

export default async function whitelistDeleteHandler(req: FastifyRequest<{ Params: WhitelistParams }>, res: FastifyReply) {
    const { name } = req.params

    if (!name) {
        return res.status(400).send({ error: "Missing name parameter." })
    }

    try {
        console.log(`Deleting whitelist entry: name=${name}`)

        await run("BEGIN;", [])

        await run("DELETE FROM whitelist_versions WHERE name = $1;", [name])
        await run("DELETE FROM whitelist_ecosystems WHERE name = $1;", [name])
        await run("DELETE FROM whitelist_repositories WHERE name = $1;", [name])

        const deletedRows = await run("DELETE FROM whitelist WHERE name = $1 RETURNING *;", [name])

        if (deletedRows.rowCount === 0) {
            await run("ROLLBACK;", [])
            return res.status(404).send({ error: "Whitelist entry not found." })
        }

        await run("COMMIT;", [])

        return res.send({ message: `Whitelist entry '${name}' deleted successfully.` })
    } catch (error) {
        await run("ROLLBACK;", [])
        console.error("Database error:", error)
        return res.status(500).send({ error: "Internal Server Error" })
    }
}
