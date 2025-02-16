import { FastifyReply, FastifyRequest } from "fastify"

export default async function IndexHandler(_: FastifyRequest, __: FastifyReply) {
    return "Welcome to LSM!\n\nValid routes are:\nGET:\n/api/\n/api/whitelist/:name/:version/:ecosystem\n/api/blacklist/:name/:version/:ecosystem\n/api/osv/:ecosystem/:name/:version\n\nPUT:\n/api/whitelist\n/api/blacklist\n\nPOST:\n/api/whitelist\n/api/blacklist\n\nDELETE:\n/api/whitelist\n/api/blacklist"
}
