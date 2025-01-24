import { FastifyReply, FastifyRequest } from "fastify"
// import { invalidateCache } from "../flow.js"

export default async function putSample(req: FastifyRequest, res: FastifyReply) {
    try {
        const { id, name } = req.body as any
        
        if (!id || !name) {
            return res.status(400).send({ error: 'id and name is required.' })
        }

        const formattedID = id.toUpperCase()

        // invalidateCache(formattedID)
        return { message: `Updated currency ${formattedID}` }
    } catch (err) {
        const error = err as Error
        res.status(500).send({ error: error.message })
    }
}
