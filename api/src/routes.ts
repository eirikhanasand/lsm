import { FastifyInstance, FastifyPluginOptions } from "fastify"
import osvHandler from "./get/osv.js"

export default async function apiRoutes(fastify: FastifyInstance, options: FastifyPluginOptions) {
    fastify.get("/osv/:ecosystem/:name/:version", osvHandler)
}
