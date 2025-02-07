import { FastifyReply, FastifyRequest } from "fastify"

export default async function IndexHandler(_: FastifyRequest, __: FastifyReply) {
    return "Welcome to LSM!\n\nValid routes are:\n"
}
