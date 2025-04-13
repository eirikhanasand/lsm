import indexHandler from "./get/index.js"
import osvHandler from "./get/osv.js"
import auditHandler from "./get/audit.js"
import packageStatsHandler from "./get/statistics.js"
import listPostHandler from "./post/list.js"
import workerPostHandler from "./post/worker.js"
import listPutHandler from "./put/list.js"
import listDeleteHandler from "./delete/list.js"
import { loginHandler, logoutHandler, loginCallbackHandler } from "./get/auth.js"
import { FastifyInstance, FastifyPluginOptions } from "fastify"
import listHandler from "./get/listHandler.js"

export default async function apiRoutes(fastify: FastifyInstance, _: FastifyPluginOptions) {
    // GET handlers
    fastify.get("/", indexHandler)
    fastify.get("/osv/:ecosystem/:name/:version", osvHandler)
    fastify.get("/list/:list", listHandler)
    fastify.get("/oauth2/login", loginHandler)
    fastify.get("/oauth2/callback", loginCallbackHandler)
    fastify.get("/oauth2/logout", logoutHandler)
    fastify.get("/statistics", packageStatsHandler)
    fastify.get("/audit", auditHandler)

    // POST handlers
    fastify.post("/list/:list", listPostHandler)
    fastify.post("/worker", workerPostHandler)

    // PUT handlers 
    fastify.put("/list/:list", listPutHandler)

    // DELETE handlers
    fastify.delete("/list/:list/:name", listDeleteHandler)
}
