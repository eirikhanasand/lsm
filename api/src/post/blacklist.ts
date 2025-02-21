import { FastifyReply, FastifyRequest } from "fastify"
import run from "../db.js"

export default async function blacklistPostHandler(req: FastifyRequest, res: FastifyReply) {
    const { ecosystem, name, version, repository, comment } = req.body as OSVHandlerParams
    if (!ecosystem || !name || !version || !comment) {
        return res.status(400).send({ error: "Missing name, version, ecosystem, comment." })
    }

    try {
        console.log(`Adding to blacklist: name=${name}, version=${version}, ecosystem=${ecosystem}, repository=${repository}, comment=${comment}`)

        await run(
            `INSERT INTO blacklist (name) 
             SELECT $1 WHERE NOT EXISTS (SELECT 1 FROM blacklist WHERE name = $1);`, 
            [name]
        )

        await run(
            `INSERT INTO blacklist_versions (name, version) 
             SELECT $1, $2 WHERE NOT EXISTS (SELECT 1 FROM blacklist_versions WHERE name = $1 AND version = $2);`, 
            [name, version]
        )

        await run(
            `INSERT INTO blacklist_ecosystems (name, ecosystem) 
             SELECT $1, $2 WHERE NOT EXISTS (SELECT 1 FROM blacklist_ecosystems WHERE name = $1 AND ecosystem = $2);`, 
            [name, ecosystem]
        )

        if (repository) {
            await run(
                `INSERT INTO blacklist_repositories (name, repository) 
                 SELECT $1, $2 WHERE NOT EXISTS (SELECT 1 FROM blacklist_repositories WHERE name = $1 AND repository = $2);`, 
                [name, repository]
            )
        }

        await run(
            `INSERT INTO blacklist_comments (name, comment) 
             SELECT $1, $2 WHERE NOT EXISTS (SELECT 1 FROM blacklist_comments WHERE name = $1 AND comment = $2);`, 
            [name, comment]
        )

        return res.send({ message: "Added to blacklist successfully." })
    } catch (error) {
        console.error("Database error:", error)
        return res.status(500).send({ error: "Internal Server Error" })
    }
}
