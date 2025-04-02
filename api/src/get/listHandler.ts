import { FastifyReply, FastifyRequest } from "fastify"
import fetchList from "../utils/list/fetchList"

type ListHandlerProps = {
    list: 'white' | 'black'
    req: FastifyRequest
    res: FastifyReply
}

export default async function listHandler({req, res, list}: ListHandlerProps) {
    const { ecosystem, name: Name, version: Version } = req.params as OSVHandlerParams
    if (!ecosystem || !Name || !Version) {
        return res.status(400).send({ error: "Missing name, version, or ecosystem." })
    }

    const name = decodeURIComponent(Name)
    const version = decodeURIComponent(Version)

    return fetchList({name, ecosystem, version, res, list})
}
