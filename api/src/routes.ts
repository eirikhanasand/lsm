import { FastifyInstance, FastifyPluginOptions } from "fastify"
import putSample from "./put/sample.js"
import indexHandler from "./get/index.js"
import whitelistHandler from "./get/index.js"
import osvHandler from "./post/osv.js"

export default async function apiRoutes(fastify: FastifyInstance, options: FastifyPluginOptions) {
    // get handlers
    fastify.get("/", indexHandler)
    fastify.get("/whitelist", whitelistHandler)
    
    // post handlers
    fastify.post("/osv", osvHandler)

    // put handlers
    fastify.put("/", putSample)
}
