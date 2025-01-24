import { FastifyReply, FastifyRequest } from "fastify"

export default async function whitelistHandler(req: FastifyRequest, _: FastifyReply) {
    const id = (req.params as any).id as string

    return {
        message: `Fetched whitelist for "${id}"`
    }



    try {
        // a
    } catch (error) {
        console.error(error)
        return { error }
    }
}
