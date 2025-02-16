import indexHandler from "./get/index.js"

import osvHandler from "./get/osv.js"
import blacklistPostHandler from "./post/blacklist.js"
import whitelistPostHandler from "./post/whitelist.js"
import whitelistPutHandler from "./put/whitelist.js"
import blacklistPutHandler from "./put/blacklist.js"
import whitelistDeleteHandler from "./delete/whitelist.js"
import blacklistDeleteHandler from "./delete/blacklist.js"
import whitelistHandler from "./get/whitelist.js"
import blacklistHandler from "./get/blacklist.js"
import { FastifyInstance, FastifyPluginOptions } from "fastify"

export default async function apiRoutes(fastify: FastifyInstance, options: FastifyPluginOptions) {
    // GET handlers
    fastify.get("/", indexHandler)
    fastify.get("/osv/:ecosystem/:name/:version", osvHandler)
    fastify.get("/whitelist/:ecosystem/:name/:version", whitelistHandler)
    fastify.get("/blacklist/:ecosystem/:name/:version", blacklistHandler)

    // POST handlers
    fastify.post("/whitelist", whitelistPostHandler)
    fastify.post("/blacklist", blacklistPostHandler)

    // PUT handlers 
    fastify.put("/whitelist/:name/:oldVersion/:newVersion/:ecosystem", whitelistPutHandler)
    fastify.put("/blacklist/:name/:oldVersion/:newVersion/:ecosystem", blacklistPutHandler)

    // DELETE handlers
    fastify.delete("/whitelist/:name", whitelistDeleteHandler)
    fastify.delete("/blacklist/:name", blacklistDeleteHandler)
    fastify.delete("/whitelist/:name/:version", whitelistDeleteHandler)
    fastify.delete("/blacklist/:name/:version", blacklistDeleteHandler)
}

