import { FastifyReply, FastifyRequest } from 'fastify'
import run from '../../db.js'
import tokenWrapper from '../../utils/tokenWrapper.js'

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

        await run(
            `INSERT INTO ${list} (name, comment) 
             SELECT $1, $2
             WHERE NOT EXISTS (SELECT 1 FROM ${list} WHERE name = $1);`,
            [name, comment]
        )

        if (Array.isArray(versions) && versions.length) {
            for (const version of versions) {
                await run(
                    `INSERT INTO ${list}_versions (name, version) 
                     SELECT $1, $2 
                     WHERE NOT EXISTS (SELECT 1 FROM ${list}_versions WHERE name = $1 AND version = $2);`,
                    [name, version]
                )
            }
        }

        if (Array.isArray(ecosystems) && ecosystems.length) {
            for (const ecosystem of ecosystems) {
                await run(
                    `INSERT INTO ${list}_ecosystems (name, ecosystem) 
                     SELECT $1, $2 
                     WHERE NOT EXISTS (SELECT 1 FROM ${list}_ecosystems WHERE name = $1 AND ecosystem = $2);`,
                    [name, ecosystem]
                )
            }
        }

        if (Array.isArray(repositories) && repositories.length) {
            for (const repository of repositories) {
                await run(
                    `INSERT INTO ${list}_repositories (name, repository) 
                     SELECT $1, $2 
                     WHERE NOT EXISTS (SELECT 1 FROM ${list}_repositories WHERE name = $1 AND repository = $2);`,
                    [name, repository]
                )
            }
        }

        if (Array.isArray(references) && references.length) {
            for (const reference of references) {
                await run(
                    `INSERT INTO ${list}_references (name, reference) 
                     SELECT $1, $2 
                     WHERE NOT EXISTS (SELECT 1 FROM ${list}_references WHERE name = $1 AND reference = $2);`,
                    [name, reference]
                )
            }
        }

        await run(
            `INSERT INTO ${list}_authors (name, author) 
             SELECT $1, $2 
             WHERE NOT EXISTS (SELECT 1 FROM ${list}_authors WHERE name = $1 AND author = $2);`,
            [name, author.id]
        )

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
