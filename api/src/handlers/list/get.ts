import { FastifyReply, FastifyRequest } from 'fastify'
import fetchList from '../../utils/list/fetchList.js'

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
