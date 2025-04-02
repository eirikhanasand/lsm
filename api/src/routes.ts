import indexHandler from "./get/index.js"
import osvHandler from "./get/osv.js"
import auditHandler from "./get/audit.js"
import packageStatsHandler from "./get/statistics.js"
import whitelistPostHandler from "./post/whitelist.js"
import blacklistPostHandler from "./post/blacklist.js"
import workerPostHandler from "./post/worker.js"
import whitelistPutHandler from "./put/whitelist.js"
import blacklistPutHandler from "./put/blacklist.js"
import whitelistDeleteHandler from "./delete/whitelist.js"
import blacklistDeleteHandler from "./delete/blacklist.js"
import { loginHandler, logoutHandler, loginCallbackHandler } from "./get/auth.js"
import { FastifyInstance, FastifyPluginOptions } from "fastify"
import listRepositoryHandler from "./get/listRepository.js"
import listHandler from "./get/listHandler.js"
import indexListHandler from "./get/indexListHandler.js"

export default async function apiRoutes(fastify: FastifyInstance, _: FastifyPluginOptions) {
    // GET handlers
    fastify.get("/", indexHandler)
    fastify.get("/osv/:ecosystem/:name/:version", osvHandler)
    fastify.get("/whitelist", (req, res) => indexListHandler({req, res, list: 'white'}))
    fastify.get("/blacklist", (req, res) => indexListHandler({req, res, list: 'black'}))
    fastify.get("/whitelist/:ecosystem/:name/:version", (req, res) => listHandler({req, res, list: 'white'}))
    fastify.get("/blacklist/:ecosystem/:name/:version", (req, res) => listHandler({req, res, list: 'black'}))
    fastify.get("/whitelist/:repository", (req, res) => listRepositoryHandler({req, res, list: 'white'}))
    fastify.get("/blacklist/:repository", (req, res) => listRepositoryHandler({req, res, list: 'black'}))
    fastify.get("/oauth2/login", loginHandler)
    fastify.get("/oauth2/callback", loginCallbackHandler)
    fastify.get("/oauth2/logout", logoutHandler)
    fastify.get("/statistics/:timestart/:timeend", packageStatsHandler)
    fastify.get("/audit", auditHandler)

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
