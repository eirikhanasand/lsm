import { FastifyReply, FastifyRequest } from "fastify"
import fetchList from "../utils/list/fetchList.js"

export default async function listHandler(req: FastifyRequest, res: FastifyReply) {
    const { list } = req.params as {list: 'white' | 'black'}
    const { 
        ecosystem, 
        name, 
        page, 
        resultsPerPage, 
        version, 
        startDate, 
        endDate
    } = (req.body ?? {}) as Partial<ListQueryProps>
    return fetchList({
        name, 
        ecosystem, 
        version, 
        res, 
        list, 
        startDate, 
        endDate, 
        page, 
        resultsPerPage
    })
}
