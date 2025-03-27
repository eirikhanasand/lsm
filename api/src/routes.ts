import indexHandler from "./get/index.js"
import osvHandler from "./get/osv.js"
import auditHandler from "./get/audit.js"
import cveHandler from "./get/cve.js"
import packageStatsHandler from "./get/statistics.js"
import whitelistIndexHandler, { whitelistHandler, whitelistByRepositoryHandler } from "./get/whitelist.js"
import blacklistIndexHandler, { blacklistHandler, blacklistByRepositoryHandler } from "./get/blacklist.js"
import whitelistPostHandler from "./post/whitelist.js"
import blacklistPostHandler from "./post/blacklist.js"
import workerPostHandler from "./post/worker.js"
import whitelistPutHandler from "./put/whitelist.js"
import blacklistPutHandler from "./put/blacklist.js"
import whitelistDeleteHandler from "./delete/whitelist.js"
import blacklistDeleteHandler from "./delete/blacklist.js"
import { loginHandler, logoutHandler, loginCallbackHandler } from "./get/auth.js"
import { FastifyInstance, FastifyPluginOptions } from "fastify"

export default async function apiRoutes(fastify: FastifyInstance, _: FastifyPluginOptions) {
    // GET handlers
    fastify.get("/", indexHandler)
    fastify.get("/osv/:ecosystem/:name/:version", osvHandler)
    fastify.get("/whitelist", whitelistIndexHandler)
    fastify.get("/blacklist", blacklistIndexHandler)
    fastify.get("/whitelist/:ecosystem/:name/:version", whitelistHandler)
    fastify.get("/blacklist/:ecosystem/:name/:version", blacklistHandler)
    fastify.get("/whitelist/:repository", whitelistByRepositoryHandler)
    fastify.get("/blacklist/:repository", blacklistByRepositoryHandler)
    fastify.get("/oauth2/login", loginHandler)
    fastify.get("/oauth2/callback", loginCallbackHandler)
    fastify.get("/oauth2/logout", logoutHandler)
    fastify.get("/statistics/:timestart/:timeend", packageStatsHandler)
    fastify.get("/audit", auditHandler)
    fastify.get("/cve/:name", cveHandler)

    // POST handlers
    fastify.post("/whitelist", whitelistPostHandler)
    fastify.post("/blacklist", blacklistPostHandler)
    fastify.post("/worker", workerPostHandler)

    // PUT handlers 
    fastify.put("/whitelist", whitelistPutHandler)
    fastify.put("/blacklist", blacklistPutHandler)

    // DELETE handlers
    fastify.delete("/whitelist/:name", whitelistDeleteHandler)
    fastify.delete("/blacklist/:name", blacklistDeleteHandler)
}
