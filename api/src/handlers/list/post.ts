import { FastifyReply, FastifyRequest } from 'fastify'
import run from '../../db.js'
import tokenWrapper from '../../utils/tokenWrapper.js'

/**
 * Posts entries to the allowlist or blocklist. Includes optional parameters
 * which can be included for filtering.
 * 
 * Required header: `token`
 * 
 * Required parameter: `list` (`allow`/`block`)
 * 
 * Required body parameters: `name`, `comment`, `author`
 * 
 * Optional body parameters: `ecosystems`, `versions`, `repositories`, `references`
 * 
 * @param req Incoming Fastify Request
 * @param res Outgoing Fastify Response
 * 
 * @returns Fastify Response
 */
export default async function listPostHandler(req: FastifyRequest, res: FastifyReply) {
    const { valid } = await tokenWrapper(req, res)
    if (!valid) {
        return res.status(400).send({ error: 'Unauthorized' })
    }

    const { list } = req.params as { list: 'allow' | 'block' }
    if (list !== 'allow' && list !== 'block') {
        return res.status(400).send({ error: "List must be either 'allow' or 'block'." })
    }

    const { ecosystems, name, versions, repositories, comment, references, author } = req.body as PostBody || {}
    if (!name || !comment || !author) {
        return res.status(400).send({ error: 'Missing name, comment or author.' })
    }

    try {
        const result = await run(`SELECT name from ${list} where name = $1`, [name])
        if (result.rows.length) {
            return res.status(409).send({
                error: `${name} is already ${list}ed. Update the existing one instead.`
            })
        }

        console.log(
            `Adding to ${list}list:` +
            ` name=${name},` +
            ` versions=${versions},` +
            ` ecosystems=${ecosystems},` +
            ` repositories=${repositories},` +
            ` comment=${comment},` +
            ` references=${references},` +
            ` author=${author}`
        )

        // Inserts the package entry into the appropriate list.
        await run(
            `INSERT INTO ${list} (name, comment) 
             SELECT $1, $2
             WHERE NOT EXISTS (SELECT 1 FROM ${list} WHERE name = $1);`,
            [name, comment]
        )

        // Inserts the package versions (if any).
        if (Array.isArray(versions) && versions.length > 0) {
            for (const version of versions) {
                await run(
                    `INSERT INTO ${list}_versions (name, version) 
                     SELECT $1, $2 
                     WHERE NOT EXISTS (SELECT 1 FROM ${list}_versions WHERE name = $1 AND version = $2);`,
                    [name, version]
                )
            }
        }

        // Inserts the package ecosystems (if any).
        if (Array.isArray(ecosystems) && ecosystems.length > 0) {
            for (const ecosystem of ecosystems) {
                await run(
                    `INSERT INTO ${list}_ecosystems (name, ecosystem) 
                     SELECT $1, $2 
                     WHERE NOT EXISTS (SELECT 1 FROM ${list}_ecosystems WHERE name = $1 AND ecosystem = $2);`,
                    [name, ecosystem]
                )
            }
        }

        // Inserts the package repositories (if any).
        if (Array.isArray(repositories) && repositories.length > 0) {
            for (const repository of repositories) {
                await run(
                    `INSERT INTO ${list}_repositories (name, repository) 
                     SELECT $1, $2 
                     WHERE NOT EXISTS (SELECT 1 FROM ${list}_repositories WHERE name = $1 AND repository = $2);`,
                    [name, repository]
                )
            }
        }

        // Inserts the package references (if any).
        if (Array.isArray(references) && references.length > 0) {
            for (const reference of references) {
                await run(
                    `INSERT INTO ${list}_references (name, reference) 
                     SELECT $1, $2 
                     WHERE NOT EXISTS (SELECT 1 FROM ${list}_references WHERE name = $1 AND reference = $2);`,
                    [name, reference]
                )
            }
        }

        // Inserts the package authors (if any).
        await run(
            `INSERT INTO ${list}_authors (name, author) 
             SELECT $1, $2 
             WHERE NOT EXISTS (SELECT 1 FROM ${list}_authors WHERE name = $1 AND author = $2);`,
            [name, author.id]
        )

        // Inserts other package metadata such as created, updated, changelog and audit log.
        await run(`INSERT INTO ${list}_created (name, id) VALUES ($1, $2);`, [name, author.id])
        await run(`INSERT INTO ${list}_updated (name, id) VALUES ($1, $2);`, [name, author.id])
        const audit = `Added ${name} ${Array.isArray(versions) && versions.length ? `versions ${versions.join(', ')}` : 'for all versions'} ${Array.isArray(ecosystems) && ecosystems.length ? `${Array.isArray(versions) && versions.length ? 'with' : 'for'} ecosystems ${ecosystems.join(', ')}` : 'for all ecosystems'} to the ${list}list for ${Array.isArray(repositories) && repositories.length ? repositories.join(', ') : 'all repositories'} with comment ${comment}${Array.isArray(references) && references.length ? ` and references ${references}` : ''}.`
        await run(`INSERT INTO ${list}_changelog (event, name, author) VALUES ($1, $2, $3);`, [audit, name, author.id])
        await run(`INSERT INTO audit_log (event, author) VALUES ($1, $2);`, [audit, author.id])

        return res.send({ message: `Added to ${list} successfully.` })
    } catch (error) {
        console.error(`Database error: ${JSON.stringify(error)}`)
        return res.status(500).send({ error: 'Internal Server Error' })
    }
}
