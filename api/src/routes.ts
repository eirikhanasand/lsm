import { FastifyInstance, FastifyPluginOptions } from "fastify"
import indexHandler from "./get/index.js"
import whitelistHandler from "./get/index.js"
import osvHandler from "./get/osv.js"
// import osvHandler from "./post/osv.js"
// import putSample from "./put/sample.js"

export default async function apiRoutes(fastify: FastifyInstance, options: FastifyPluginOptions) {
    // get handlers
    fastify.get("/", indexHandler)
    fastify.get("/whitelist", whitelistHandler)
    fastify.get("/osv/:ecosystem/:name/:version", osvHandler)
    
    // post handlers
    // fastify.post("/osv", osvHandler)

    // put handlers
    // fastify.put("/", putSample)
}
