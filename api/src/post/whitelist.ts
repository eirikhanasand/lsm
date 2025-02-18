import { FastifyReply, FastifyRequest } from "fastify"
import run from "../db.js"

export default async function whitelistPostHandler(req: FastifyRequest, res: FastifyReply) {
    const { ecosystem, name, version, repository, comment } = req.body as OSVHandlerParams
    if (!ecosystem || !name || !version || !comment) {
        return res.status(400).send({ error: "Missing name, version, ecosystem, comment." })
    }

    try {
        console.log(`Adding to whitelist: name=${name}, version=${version}, ecosystem=${ecosystem}, repository=${repository}, comment=${comment}`)

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

        if (repository) {
            await run(
                `INSERT INTO whitelist_repositories (name, repository) 
                 SELECT $1, $2 WHERE NOT EXISTS (SELECT 1 FROM whitelist_repositories WHERE name = $1 AND repository = $2);`, 
                [name, repository]
            )
        }

        await run(
            `INSERT INTO whitelist_comments (name, comment) 
             SELECT $1, $2 WHERE NOT EXISTS (SELECT 1 FROM whitelist_comments WHERE name = $1 AND comment = $2);`, 
            [name, comment]
        )

        return res.send({ message: "Added to whitelist successfully." })
    } catch (error) {
        console.error("Database error:", error)
        return res.status(500).send({ error: "Internal Server Error" })
    }
}
