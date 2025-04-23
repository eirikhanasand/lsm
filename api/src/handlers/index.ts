import { FastifyReply, FastifyRequest } from 'fastify'

export default async function IndexHandler(request: FastifyRequest, _: FastifyReply) {
    const routes = request.server.printRoutes({ commonPrefix: false })
    return `Welcome to the Library Safety Manager!\n\nValid routes are:\n${routes}`
}
