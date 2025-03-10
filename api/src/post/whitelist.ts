import { FastifyReply, FastifyRequest } from "fastify"
import run from "../db.js"

export default async function whitelistPostHandler(req: FastifyRequest, res: FastifyReply) {
    const { ecosystem, name, version, repository, comment, author } = req.body as OSVHandlerParams
    if (!name || !version || !comment || !author) {
        return res.status(400).send({ error: "Missing name, version, ecosystem, comment or author." })
    }

    try {
        console.log(`Adding to whitelist: name=${name}, version=${version}, ecosystem=${ecosystem}, repository=${repository}, comment=${comment}, author=${author}`)

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

        if (ecosystem) {
            await run(
                `INSERT INTO whitelist_ecosystems (name, ecosystem) 
                 SELECT $1, $2 WHERE NOT EXISTS (SELECT 1 FROM whitelist_ecosystems WHERE name = $1 AND ecosystem = $2);`, 
                [name, ecosystem]
            )
        }

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

        await run(
            `INSERT INTO whitelist_authors (name, author) 
             SELECT $1, $2 WHERE NOT EXISTS (SELECT 1 FROM whitelist_authors WHERE name = $1 AND author = $2);`, 
            [name, author]
        )

        await run(`INSERT INTO whitelist_createdat (name) VALUES ($1);`, [name])
        await run(`INSERT INTO whitelist_createdby (name, createdby) VALUES ($1, $2);`, [name, author])
        await run(`INSERT INTO whitelist_updatedat (name) VALUES ($1);`, [name])
        await run(`INSERT INTO whitelist_updatedby (name, updatedby) VALUES ($1, $2);`, [name, author])
        await run(
            `INSERT INTO whitelist_changelog (event, name, author) VALUES ($1, $2, $3);`, 
            [`Added ${name} version ${version} ${ecosystem ? `with ecosystem ${ecosystem}` : 'for all ecosystems'} to the whitelist for ${repository ? repository : 'all repositories'} with comment ${comment}.`, name, author]
        )

        await run(
            `INSERT INTO audit_log (event, author) VALUES ($1, $2);`, 
            [`Added ${name} version ${version} ${ecosystem ? `with ecosystem ${ecosystem}` : 'for all ecosystems'} to the whitelist for ${repository ? repository : 'all repositories'} with comment ${comment}.`, author]
        )

        return res.send({ message: "Added to whitelist successfully." })
    } catch (error) {
        console.error("Database error:", error)
        return res.status(500).send({ error: "Internal Server Error" })
    }
}
