import { FastifyReply, FastifyRequest } from "fastify"
import run from "../db.js"

type BlacklistParams = {
    name: string
}

export default async function blacklistDeleteHandler(req: FastifyRequest<{ Params: BlacklistParams }>, res: FastifyReply) {
    const { name } = req.params

    if (!name) {
        return res.status(400).send({ error: "Missing name parameter." })
    }

    try {
        console.log(`Deleting blacklist entry: name=${name}`)

        await run("BEGIN;", [])

        await run("DELETE FROM blacklist_versions WHERE name = $1;", [name])
        await run("DELETE FROM blacklist_ecosystems WHERE name = $1;", [name])
        await run("DELETE FROM blacklist_repositories WHERE name = $1;", [name])

        const deletedRows = await run("DELETE FROM blacklist WHERE name = $1 RETURNING *;", [name])

        if (deletedRows.rowCount === 0) {
            await run("ROLLBACK;", [])
            return res.status(404).send({ error: "Blacklist entry not found." })
        }

        await run("COMMIT;", [])

        return res.send({ message: `Blacklist entry '${name}' deleted successfully.` })
    } catch (error) {
        await run("ROLLBACK;", [])
        console.error("Database error:", error)
        return res.status(500).send({ error: "Internal Server Error" })
    }
}
