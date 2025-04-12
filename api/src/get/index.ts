import { FastifyReply, FastifyRequest } from "fastify"

export default async function IndexHandler(request: FastifyRequest, _: FastifyReply) {
    const routes = request.server.printRoutes({ commonPrefix: false })
    return `Welcome to LSM!\n\nValid routes are:\n${routes}`
}
