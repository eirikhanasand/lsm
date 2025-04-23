import { FastifyReply, FastifyRequest } from "fastify"
import run from "../../db.js"
import { loadSQL } from "../../utils/loadSQL.js"
import config from "../../constants.js"

const { DEFAULT_RESULTS_PER_PAGE } = config

type AuditResponse = {
    id: number
    event: string
    author: User
}

export default async function auditHandler(req: FastifyRequest, res: FastifyReply) {
    const {
        author,
        startDate,
        endDate,
        ecosystem,
        name,
        page,
        resultsPerPage: clientResultsPerPage,
        version,
        list
    } = req.query as AuditLogQueryProps
    const resultsPerPage = (clientResultsPerPage || Number(DEFAULT_RESULTS_PER_PAGE) || 50)
    try {
        console.log(
            `Fetching audit log with author=${author}, startDate=${startDate}, 
            endDate=${endDate}, name=${name}, ecosystem=${ecosystem}, 
            version=${version}, list=${list}`
        )
        const query = await loadSQL("fetchAuditLog.sql")
        const result = await run(query, [
            author || null,
            startDate || null,
            endDate || null,
            name || null,
            ecosystem || null,
            version || null,
            list || null,
            resultsPerPage,
            Number(page) || 1
        ])

        const pages = Math.ceil((result.rowCount || 1) / resultsPerPage)
        if ((Number(page) || 1) > pages) {
            console.error(`Page does not exist (${page} / ${pages})`)
            return res.send({
                page,
                pages,
                resultsPerPage,
                error: `Page does not exist (${page} / ${pages})`,
                results: []
            })
        }
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
        return res.status(500).send({ error: "Internal Server Error" })
    }
}

async function getDetails(id: string): Promise<{ name: string, avatar: string }> {
    const details = await run(`SELECT name, avatar FROM users WHERE id = $1`, [id])
    return details.rows[0]
}
