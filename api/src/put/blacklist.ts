import { FastifyReply, FastifyRequest } from "fastify"
import { runInTransaction } from "../db.js"

export default async function blacklistPutHandler(req: FastifyRequest, res: FastifyReply) {
    const { ecosystems, name, versions, comment, repositories, author, references } = req.body as UpdateBody
    if (!name || !comment || !author) {
        return res
            .status(400)
            .send({ error: "Missing name, comment or author." })
    }

    try {
        console.log(`Replacing blacklist version: name=${name}, versions=${versions}, ecosystems=${ecosystems}, repositories=${repositories}, author=${author}, references=${references}, comment=${comment}`)

        await runInTransaction(async (client) => {
            const checkExists = await client.query("SELECT name FROM blacklist WHERE name = $1;", [name])
            if (checkExists.rowCount === 0) {
                throw new Error("Blacklist entry not found.")
            }

            await client.query(`UPDATE blacklist SET comment = $2 WHERE name = $1;`, [name, comment])

            if (Array.isArray(versions)) {
                await client.query("DELETE FROM blacklist_versions WHERE name = $1;", [name])
                for (const version of versions) {
                    await client.query(
                        `
                            INSERT INTO blacklist_versions (name, version)
                            SELECT $1, $2 
                            WHERE NOT EXISTS (SELECT 1 FROM blacklist_versions WHERE name = $1 AND version = $2);
                        `,
                        [name, version]
                    )
                }
            }

            if (Array.isArray(ecosystems)) {
                await client.query("DELETE FROM blacklist_ecosystems WHERE name = $1;", [name])
                for (const ecosystem of ecosystems) {
                    await client.query(
                        `
                            INSERT INTO blacklist_ecosystems (name, ecosystem)
                            SELECT $1, $2 
                            WHERE NOT EXISTS (SELECT 1 FROM blacklist_ecosystems WHERE name = $1 AND ecosystem = $2);
                        `,
                        [name, ecosystem]
                    )
                }
            }

            if (Array.isArray(references)) {
                await client.query("DELETE FROM blacklist_references WHERE name = $1;", [name])
                for (const reference of references) {
                    await client.query(
                        `
                            INSERT INTO blacklist_references (name, reference)
                            SELECT $1, $2 
                            WHERE NOT EXISTS (SELECT 1 FROM blacklist_references WHERE name = $1 AND reference = $2);
                        `,
                        [name, reference]
                    )
                }
            }

            if (Array.isArray(repositories)) {
                await client.query("DELETE FROM blacklist_repositories WHERE name = $1;", [name])
                for (const repository of repositories) {
                    await client.query(
                        `
                            INSERT INTO blacklist_repositories (name, repository)
                            SELECT $1, $2 
                            WHERE NOT EXISTS (SELECT 1 FROM blacklist_repositories WHERE name = $1 AND repository = $2);
                        `,
                        [name, repository]
                    )
                }
            }

            await client.query(`INSERT INTO blacklist_updated (name, id) VALUES ($1, $2);`, [name, author.id])
            const audit = `Updated ${name} with versions ${versions.join(', ')} ${Array.isArray(ecosystems) && ecosystems.length ? `with ecosystems ${ecosystems.join(', ')}` : 'for all ecosystems'} to the blacklist for ${Array.isArray(repositories) && repositories.length ? repositories.join(', ') : 'all repositories'} with comment ${comment}${Array.isArray(references) && references.length ? ` and references ${references.join(', ')}`: ''}.`
            await client.query(`INSERT INTO blacklist_changelog (event, name, author) VALUES ($1, $2, $3);`, [audit, name, author.id])
            await client.query(`INSERT INTO audit_log (event, author) VALUES ($1, $2);`, [audit, author.id])
        })

        return res.send({ message: "Blacklist entry updated successfully." })
    } catch (error: any) {
        console.error("Database error:", error)
        if (error.message.includes("not found")) {
            return res.status(404).send({ error: error.message })
        }
        return res.status(500).send({ error: "Internal Server Error" })
    }
}
