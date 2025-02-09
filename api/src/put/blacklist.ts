import { FastifyReply, FastifyRequest } from "fastify"
import run from "../db.js"

type BlacklistEntry = {
    name: string
    version: string
    ecosystem: string
}

export default async function blacklistPutHandler(req: FastifyRequest<{ Body: BlacklistEntry }>, res: FastifyReply) {
    const { name, version, ecosystem } = req.body

    if (!name || !version || !ecosystem) {
        return res.status(400).send({ error: "Missing name, version, or ecosystem." })
    }

    try {
        console.log(`Updating blacklist: name=${name}, version=${version}, ecosystem=${ecosystem}`)

        const checkExists = await run("SELECT name FROM blacklist WHERE name = $1;", [name])
        if (checkExists.rowCount === 0) {
            return res.status(404).send({ error: "Blacklist entry not found." })
        }

        await run(`
            INSERT INTO blacklist_versions (name, version) 
            VALUES ($1, $2)
            ON CONFLICT (name) DO UPDATE SET version = EXCLUDED.version;
        `, [name, version])

        await run(`
            INSERT INTO blacklist_ecosystems (name, ecosystem) 
            VALUES ($1, $2)
            ON CONFLICT (name) DO UPDATE SET ecosystem = EXCLUDED.ecosystem;
        `, [name, ecosystem])

        return res.send({ message: "Blacklist entry updated successfully." })
    } catch (error) {
        console.error("Database error:", error)
        return res.status(500).send({ error: "Internal Server Error" })
    }
}
