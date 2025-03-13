import { FastifyReply, FastifyRequest } from "fastify"
import { runInTransaction } from "../db.js"

export default async function blacklistPutHandler(req: FastifyRequest, res: FastifyReply) {
    const { ecosystem, name, version, comment, repository, author, reference } = req.body as UpdateBody
    if (!name || !comment || !author) {
        return res
          .status(400)
          .send({ error: "Missing name, comment or author." })
    }

    try {
        console.log(`Replacing blacklist version: name=${name}, version=${version}, ecosystem=${ecosystem}, comment=${comment}, repository=${repository}, author=${author}, reference=${reference}`)

        await runInTransaction(async (client) => {
            const checkExists = await client.query("SELECT name FROM blacklist WHERE name = $1;", [name])
            if (checkExists.rowCount === 0) {
                throw new Error("blacklist entry not found.")
            }

            await client.query("DELETE FROM blacklist_versions WHERE name = $1;", [name])
            await client.query(
                `
                    INSERT INTO blacklist_versions (name, version)
                    SELECT $1, $2 WHERE NOT EXISTS (SELECT 1 FROM blacklist_versions WHERE name = $1 AND version = $2);
                `,
                [name, version]
            )

            await client.query("DELETE FROM blacklist_ecosystems WHERE name = $1;", [name])
            await client.query(
                `
                    INSERT INTO blacklist_ecosystems (name, ecosystem)
                    SELECT $1, $2 WHERE NOT EXISTS (SELECT 1 FROM blacklist_ecosystems WHERE name = $1 AND ecosystem = $2);
                `,
                [name, ecosystem]
            )

            await client.query("DELETE FROM blacklist_comments WHERE name = $1;", [name])
            await client.query(
                `
                    INSERT INTO blacklist_comments (name, comment)
                    SELECT $1, $2 WHERE NOT EXISTS (SELECT 1 FROM blacklist_comments WHERE name = $1 AND comment = $2);
                `,
                [name, comment]
            )

            if (reference) {
                await client.query("DELETE FROM blacklist_references WHERE name = $1;", [name])
                await client.query(
                    `
                        INSERT INTO blacklist_references (name, reference)
                        SELECT $1, $2 WHERE NOT EXISTS (SELECT 1 FROM blacklist_references WHERE name = $1 AND reference = $2);
                    `,
                    [name, reference]
                )
            }

            await client.query("DELETE FROM blacklist_repositories WHERE name = $1;", [name])
            await client.query(
                `
                    INSERT INTO blacklist_repositories (name, repository)
                    SELECT $1, $2 WHERE NOT EXISTS (SELECT 1 FROM blacklist_repositories WHERE name = $1 AND repository = $2);
                `,
                [name, repository]
            )

            await client.query(`INSERT INTO blacklist_updated (name, id) VALUES ($1, $2);`, [name, author.id])
            const audit = `Added ${name} version ${version} ${ecosystem ? `with ecosystem ${ecosystem}` : 'for all ecosystems'} to the blacklist for ${repository ? repository : 'all repositories'} with comment ${comment}${reference ? ` and reference ${reference}`: ''}.`
            await client.query(`INSERT INTO blacklist_changelog (event, name, author) VALUES ($1, $2, $3);`, [audit, name, author.id])
            await client.query(`INSERT INTO audit_log (event, author) VALUES ($1, $2);`, [audit, author.id])
        })

        return res.send({ message: "blacklist entry updated successfully." })
    } catch (error: any) {
        console.error("Database error:", error)
        if (error.message.includes("not found")) {
            return res.status(404).send({ error: error.message })
        }
        return res.status(500).send({ error: "Internal Server Error" })
    }
}
