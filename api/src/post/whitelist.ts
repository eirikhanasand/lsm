import { FastifyReply, FastifyRequest } from "fastify"
import run from "../db.js"

export default async function whitelistPostHandler(req: FastifyRequest, res: FastifyReply) {
    const { ecosystem, name, version } = req.body as OSVHandlerParams
    if (!ecosystem || !name || !version) {
        return res.status(400).send({ error: "Missing name, version, or ecosystem." })
    }

    try {
        console.log(`Adding to whitelist: name=${name}, version=${version}, ecosystem=${ecosystem}`)

        await run(
            `INSERT INTO whitelist (name) 
             SELECT $1 WHERE NOT EXISTS (SELECT 1 FROM whitelist WHERE name = $1);`, 
            [name]
        )

        await run(
            `INSERT INTO whitelist_versions (name, version) 
             SELECT $1, $2 WHERE NOT EXISTS (SELECT 1 FROM whitelist_versions WHERE name = $1 AND version = $2);`, 
            [name, version]
        )

        await run(
            `INSERT INTO whitelist_ecosystems (name, ecosystem) 
             SELECT $1, $2 WHERE NOT EXISTS (SELECT 1 FROM whitelist_ecosystems WHERE name = $1 AND ecosystem = $2);`, 
            [name, ecosystem]
        )

        return res.send({ message: "Added to whitelist successfully." })
    } catch (error) {
        console.error("Database error:", error)
        return res.status(500).send({ error: "Internal Server Error" })
    }
}
