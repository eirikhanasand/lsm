import { FastifyReply, FastifyRequest } from "fastify"
import run from "../db.js"

export default async function blacklistPostHandler(req: FastifyRequest, res: FastifyReply) {
    const { ecosystem, name, version, repository, comment, author } = req.body as OSVHandlerParams
    if (!name || !version || !comment || !author) {
        return res.status(400).send({ error: "Missing name, version, ecosystem, comment or author." })
    }

    try {
        console.log(`Adding to blacklist: name=${name}, version=${version}, ecosystem=${ecosystem}, repository=${repository}, comment=${comment}, author=${author}`)

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

        if (ecosystem) {
            await run(
                `INSERT INTO blacklist_ecosystems (name, ecosystem) 
                 SELECT $1, $2 WHERE NOT EXISTS (SELECT 1 FROM blacklist_ecosystems WHERE name = $1 AND ecosystem = $2);`, 
                [name, ecosystem]
            )
        }

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

        await run(
            `INSERT INTO blacklist_authors (name, author) 
             SELECT $1, $2 WHERE NOT EXISTS (SELECT 1 FROM blacklist_authors WHERE name = $1 AND author = $2);`, 
            [name, author.id]
        )

        await run(`INSERT INTO blacklist_created (name, id) VALUES ($1, $2);`, [name, author.id])
        await run(`INSERT INTO blacklist_updated (name, id) VALUES ($1, $2);`, [name, author.id])
        const audit = `Added ${name} version ${version} ${ecosystem ? `with ecosystem ${ecosystem}` : 'for all ecosystems'} to the blacklist for ${repository ? repository : 'all repositories'} with comment ${comment}.`
        await run(`INSERT INTO blacklist_changelog (event, name, author) VALUES ($1, $2, $3);`, [audit, name, author.id])
        await run(`INSERT INTO audit_log (event, author) VALUES ($1, $2);`, [audit, author.id])

        return res.send({ message: "Added to blacklist successfully." })
    } catch (error) {
        console.error("Database error:", error)
        return res.status(500).send({ error: "Internal Server Error" })
    }
}
