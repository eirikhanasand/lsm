import { FastifyReply, FastifyRequest } from 'fastify'
import run from '../../db.js'
import { loadSQL } from '../../utils/loadSQL.js'
import config from '../../constants.js'

const { DEFAULT_RESULTS_PER_PAGE } = config

type AuditResponse = {
    id: number
    event: string
    author: User
}

/**
 * Fetches entries from the audit log. Includes optional parameters which can be
 * included for filtering.
 * 
 * Optional parameters: `author`, `startDate`, `endDate`, `ecosystem`, `name`, 
 * `page`, `resultsPerPage`, `version`, `list`, `search`
 * 
 * @param req Incoming Fastify Request
 * @param res Outgoing Fastify Response
 * 
 * @returns Fastify Response
 */
export default async function auditHandler(req: FastifyRequest, res: FastifyReply) {
    const {
        author,
        startDate,
        endDate,
        ecosystem,
        name,
        page: Page,
        resultsPerPage: clientResultsPerPage,
        version,
        list,
        search
    } = (req.query ?? {}) as Partial<AuditLogQueryProps>
    const page = Number(Page) || 1
    const resultsPerPage = (clientResultsPerPage || Number(DEFAULT_RESULTS_PER_PAGE) || 50)
    try {
        console.log(
            `Fetching audit log with` +
            ` author=${author},` +
            ` startDate=${startDate},` +
            ` endDate=${endDate},` +
            ` name=${name},` +
            ` ecosystem=${ecosystem},` +
            ` version=${version},` +
            ` list=${list},` +
            ` page=${page},` +
            ` resultsPerPage=${resultsPerPage},` +
            ` search=${search}`
        )
        const query = await loadSQL('auditLog.sql')
        const logCountQuery = await loadSQL('auditLogCount.sql')
        const result = await run(query, [
            author || null,
            startDate || null,
            endDate || null,
            name || null,
            ecosystem || null,
            version || null,
            list || null,
            resultsPerPage,
            page,
            search || null
        ])
        const count = await run(logCountQuery, [
            author || null,
            startDate || null,
            endDate || null,
            name || null,
            ecosystem || null,
            version || null,
            list || null,
            search || null
        ])

        // Checks if the requested page exists
        const pages = Math.ceil((Number(count.rows[0].count) || 1) / resultsPerPage)
        if (page > pages) {
            console.error(`Page does not exist (${page} / ${pages})`)
            return res.send({
                page,
                pages,
                resultsPerPage,
                error: `Page does not exist (${page} / ${pages})`,
                results: []
            })
        }

        // Appends the author name and id to each audit entry.
        const auditLog: AuditResponse[] = await Promise.all(result.rows.map(async (row) => {
            const details = await getDetails(row.author)
            return {
                id: row.id,
                event: row.event,
                author: {
                    id: row.author,
                    name: details.name,
                    avatar: details.avatar
                },
                timestamp: row.timestamp
            }
        }))

        return res.send({
            page,
            pages,
            resultsPerPage,
            results: auditLog
        })
    } catch (error) {
        console.error(`Database error: ${JSON.stringify(error)}`)
        return res.status(500).send({ error: 'Internal Server Error' })
    }
}

/**
 * Fetches the details for a user based on the `id` parameter.
 * @param id User `id`
 * @returns The user details.
 */
async function getDetails(id: string): Promise<{ name: string, avatar: string }> {
    const details = await run(`SELECT name, avatar FROM users WHERE id = $1`, [id])
    return details.rows[0]
}
