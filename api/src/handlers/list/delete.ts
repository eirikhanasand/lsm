import { FastifyReply, FastifyRequest } from 'fastify'
import { runInTransaction } from '../../db.js'
import tokenWrapper from '../../utils/tokenWrapper.js'

/**
 * Deletes entries from the allowlist or blocklist.
 * 
 * Required header: `token`
 * 
 * Requires parameters: `name` and `list` (`allow`/`block`)
 * 
 * @param req Incoming Fastify Request
 * @param res Outgoing Fastify Response
 * 
 * @returns Fastify Response
 */
export default async function listDeleteHandler(req: FastifyRequest, res: FastifyReply) {
    const { valid } = await tokenWrapper(req, res)
    if (!valid) {
        return res.status(400).send({ error: 'Unauthorized' })
    }

    const { name, list } = req.params as { name: string, list: string }
    if (!name) {
        return res.status(400).send({ error: 'Missing name parameter.' })
    }

    try {
        // Completely deletes a package from the `allow` or `block` list.
        await runInTransaction(async (client) => {
            await client.query(`DELETE FROM ${list}_versions WHERE name = $1;`, [name])
            await client.query(`DELETE FROM ${list}_ecosystems WHERE name = $1;`, [name])
            await client.query(`DELETE FROM ${list}_repositories WHERE name = $1;`, [name])
            await client.query(`DELETE FROM ${list}_references WHERE name = $1;`, [name])
            await client.query(`DELETE FROM ${list}_authors WHERE name = $1;`, [name])
            await client.query(`DELETE FROM ${list}_created WHERE name = $1;`, [name])
            await client.query(`DELETE FROM ${list}_updated WHERE name = $1;`, [name])
            await client.query(`DELETE FROM ${list}_changelog WHERE name = $1;`, [name])

            const mainDeleteResult = await client.query(`DELETE FROM ${list} WHERE name = $1 RETURNING *;`, [name])
            if (mainDeleteResult.rowCount === 0) {
                throw new Error(`No ${list} entry found for name='${name}'.`)
            }
            return
        })
        return res.send({
            message: `All ${list} entries for '${name}' deleted successfully.`,
        })
    } catch (error: any) {
        if (error.message.includes('No entry found for name')) {
            return res.status(404).send({ error: error.message })
        }

        console.error(`Database error: ${JSON.stringify(error)}`)
        return res.status(500).send({ error: 'Internal Server Error' })
    }
}
