import { FastifyReply, FastifyRequest } from 'fastify'
import fetchList from '../../utils/list/fetchList.js'

/**
 * Fetches entries from the allowlist or blocklist. Includes optional parameters
 * which can be passed for filtering.
 * 
 * Required parameter: `list` (`allow`/`block`)
 * 
 * Optional query parameters: `ecosystem`, `name`, `page`, `resultsPerPage`, 
 * `version`, `startDate`, `repository`, `endDate`, `search`
 * 
 * @param req Incoming Fastify Request
 * @param res Outgoing Fastify Response
 * 
 * @returns Fastify Response
 */
export default async function listHandler(req: FastifyRequest, res: FastifyReply) {
    const { list } = req.params as { list: 'allow' | 'block' }
    if (list !== 'allow' && list !== 'block') {
        return res.status(400).send({ error: "List must be either 'allow' or 'block'." })
    }

    const {
        ecosystem,
        name,
        page,
        resultsPerPage,
        version,
        startDate,
        repository,
        endDate,
        search
    } = (req.query ?? {}) as Partial<ListQueryProps>

    // Decodes parameters before fetching
    return fetchList({
        name: name ? decodeURIComponent(name) : undefined,
        ecosystem: ecosystem ? decodeURIComponent(ecosystem) : undefined,
        version: version ? decodeURIComponent(version) : undefined,
        res,
        repository,
        list,
        startDate: startDate ? decodeURIComponent(startDate) : undefined,
        endDate: endDate ? decodeURIComponent(endDate) : undefined,
        page,
        resultsPerPage,
        search
    })
}
