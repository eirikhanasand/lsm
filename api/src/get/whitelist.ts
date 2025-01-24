import { FastifyReply, FastifyRequest } from "fastify"

export default async function IndexHandler(req: FastifyRequest, _: FastifyReply) {
    const id = (req.params as any).id as string

    return "Welcome to LSM!\n\nValid routes are:\n"
    
    
    try {
        // a
    } catch (error) {
        console.error(error)
        return { error }
    }
}
