import indexHandler from "./get/index.js"
import whitelistHandler from "./get/index.js"
import osvHandler from "./get/osv.js"
import blacklistPostHandler from "./post/blacklist.js"
import whitelistPostHandler from "./post/whitelist.js"
import whitelistPutHandler from "./put/whitelist.js"
import blacklistPutHandler from "./put/blacklist.js"
import whitelistDeleteHandler from "./delete/whitelist.js"
import blacklistDeleteHandler from "./delete/blacklist.js"
import blacklistHandler from "./get/blacklist.js"
import { FastifyInstance, FastifyPluginOptions } from "fastify"

export default async function apiRoutes(fastify: FastifyInstance, options: FastifyPluginOptions) {
    // get handlers
    fastify.get("/", indexHandler)
    fastify.get("/osv/:ecosystem/:name/:version", osvHandler)
    fastify.get("/whitelist", whitelistHandler)
    fastify.get("/blacklist", blacklistHandler)
    
    // post handlers
    fastify.post("/whitelist", whitelistPostHandler)
    fastify.post("/blacklist", blacklistPostHandler)

    // put handlers
    fastify.put("/whitelist", whitelistPutHandler)
    fastify.put("/blacklist", blacklistPutHandler)

    // delete handlers
    fastify.delete("/whitelist", whitelistDeleteHandler)
    fastify.delete("/blacklist", blacklistDeleteHandler)
}
