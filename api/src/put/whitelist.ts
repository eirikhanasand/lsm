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
        console.log(`Updating whitelist: name=${name}, version=${version}, ecosystem=${ecosystem}`)

        const checkExists = await run(
            `SELECT name FROM whitelist WHERE name = $1;`, 
            [name]
        )

        if (checkExists.rowCount === 0) {
            return res.status(404).send({ error: "Whitelist entry not found." })
        }

        await run(
            `UPDATE whitelist_versions 
             SET version = $2 
             WHERE name = $1;
             INSERT INTO whitelist_versions (name, version) 
             SELECT $1, $2 WHERE NOT EXISTS (SELECT 1 FROM whitelist_versions WHERE name = $1);`,
            [name, version]
        )

        await run(
            `UPDATE whitelist_ecosystems 
             SET ecosystem = $2 
             WHERE name = $1;
             INSERT INTO whitelist_ecosystems (name, ecosystem) 
             SELECT $1, $2 WHERE NOT EXISTS (SELECT 1 FROM whitelist_ecosystems WHERE name = $1);`,
            [name, ecosystem]
        )

        return res.send({ message: "Whitelist entry updated successfully." })
    } catch (error) {
        console.error("Database error:", error)
        return res.status(500).send({ error: "Internal Server Error" })
    }
}
