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

        const checkExists = await run("SELECT name FROM whitelist WHERE name = $1;", [name])
        if (checkExists.rowCount === 0) {
            return res.status(404).send({ error: "Whitelist entry not found." })
        }

        await run(`
            INSERT INTO whitelist_versions (name, version)
            VALUES ($1, $2)
            ON CONFLICT (name) DO UPDATE SET version = EXCLUDED.version;
        `, [name, version])

        await run(`
            INSERT INTO whitelist_ecosystems (name, ecosystem)
            VALUES ($1, $2)
            ON CONFLICT (name) DO UPDATE SET ecosystem = EXCLUDED.ecosystem;
        `, [name, ecosystem])

        return res.send({ message: "Whitelist entry updated successfully." })
    } catch (error) {
        console.error("Database error:", error)
        return res.status(500).send({ error: "Internal Server Error" })
    }
}
