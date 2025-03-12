import { FastifyReply, FastifyRequest } from "fastify"
import { runInTransaction } from "../db.js"

type WhitelistUpdateBody = {
    name: string
    version: string
    ecosystem: string
    comment: string
    repository: string
    author: User
}

export default async function whitelistPutHandler(req: FastifyRequest, res: FastifyReply) {
    const { ecosystem, name, version, comment, repository, author } = req.body as WhitelistUpdateBody
    if (!name || !comment || !author) {
        return res
            .status(400)
            .send({ error: "Missing name, comment or author." })
    }

    try {
        console.log(`Replacing whitelist version: name=${name}, version=${version}, ecosystem=${ecosystem}, comment=${comment}, repository=${repository}, author=${author}`)

        await runInTransaction(async (client) => {
            const checkExists = await client.query("SELECT name FROM whitelist WHERE name = $1;", [name])
            if (checkExists.rowCount === 0) {
                throw new Error("whitelist entry not found.")
            }

            await client.query("DELETE FROM whitelist_versions WHERE name = $1;", [name])
            await client.query(
                `
                    INSERT INTO whitelist_versions (name, version)
                    SELECT $1, $2 WHERE NOT EXISTS (SELECT 1 FROM whitelist_versions WHERE name = $1 AND version = $2);
                `,
                [name, version]
            )

            await client.query("DELETE FROM whitelist_ecosystems WHERE name = $1;", [name])
            await client.query(
                `
                    INSERT INTO whitelist_ecosystems (name, ecosystem)
                    SELECT $1, $2 WHERE NOT EXISTS (SELECT 1 FROM whitelist_ecosystems WHERE name = $1 AND ecosystem = $2);
                `,
                [name, ecosystem]
            )

            await client.query("DELETE FROM whitelist_comments WHERE name = $1;", [name])
            await client.query(
                `
                    INSERT INTO whitelist_comments (name, comment)
                    SELECT $1, $2 WHERE NOT EXISTS (SELECT 1 FROM whitelist_comments WHERE name = $1 AND comment = $2);
                `,
                [name, comment]
            )

            await client.query("DELETE FROM whitelist_repositories WHERE name = $1;", [name])
            await client.query(
                `
                    INSERT INTO whitelist_repositories (name, repository)
                    SELECT $1, $2 WHERE NOT EXISTS (SELECT 1 FROM whitelist_repositories WHERE name = $1 AND repository = $2);
                `,
                [name, repository]
            )

            await client.query(`INSERT INTO whitelist_updated (name, id) VALUES ($1, $2);`, [name, author.id])
            await client.query(
                `INSERT INTO whitelist_changelog (event, name, author) VALUES ($1, $2, $3);`, 
                [`Added ${name} version ${version} ${ecosystem ? `with ecosystem ${ecosystem}` : 'for all ecosystems'} to the whitelist for ${repository ? repository : 'all repositories'} with comment ${comment}.`, name, author.id]
            )

            await client.query(
                `INSERT INTO audit_log (event, author) VALUES ($1, $2);`, 
                [`Updated ${name} version ${version} ${ecosystem ? `with ecosystem ${ecosystem}` : 'for all ecosystems'} in the whitelist for ${repository ? repository : 'all repositories'} with comment ${comment}.`, author.id]
            )
        })

        return res.send({ message: "whitelist entry updated successfully." })
    } catch (error: any) {
        console.error("Database error:", error)
        if (error.message.includes("not found")) {
            return res.status(404).send({ error: error.message })
        }
        return res.status(500).send({ error: "Internal Server Error" })
    }
}
