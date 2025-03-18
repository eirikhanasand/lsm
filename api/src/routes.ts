import indexHandler from "./get/index.js"
import osvHandler from "./get/osv.js"
import packageStatsHandler from "./get/statistic.js"
import whitelistIndexHandler, { whitelistHandler, whitelistByRepositoryHandler } from "./get/whitelist.js"
import blacklistIndexHandler, { blacklistHandler, blacklistByRepositoryHandler } from "./get/blacklist.js"
import whitelistPostHandler from "./post/whitelist.js"
import blacklistPostHandler from "./post/blacklist.js"
import whitelistPutHandler from "./put/whitelist.js"
import blacklistPutHandler from "./put/blacklist.js"
import whitelistDeleteHandler from "./delete/whitelist.js"
import blacklistDeleteHandler from "./delete/blacklist.js"
import { loginHandler, logoutHandler, loginCallbackHandler } from "./get/auth.js"
import { FastifyInstance, FastifyPluginOptions } from "fastify"
import auditHandler from "./get/audit.js"
import getWorkerLogsHandler from "./get/worker-logs.js"
import postWorkerLogsHandler from "./post/workerlogs.js"

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
    fastify.get("/statistic/:timestart/:timeend", packageStatsHandler)
    fastify.get("/audit", auditHandler)
    fastify.get("/worker-logs", getWorkerLogsHandler)

    // POST handlers
    fastify.post("/whitelist", whitelistPostHandler)
    fastify.post("/blacklist", blacklistPostHandler)
    fastify.post("/worker-logs", postWorkerLogsHandler)

    // PUT handlers 
    fastify.put("/whitelist", whitelistPutHandler)
    fastify.put("/blacklist", blacklistPutHandler)

    // DELETE handlers
    fastify.delete("/whitelist/:name", whitelistDeleteHandler)
    fastify.delete("/blacklist/:name", blacklistDeleteHandler)
}
