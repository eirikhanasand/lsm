import indexHandler from "./handlers/index.js"
import osvHandler from "./handlers/osv/get.js"
import auditHandler from "./handlers/audit/get.js"
import packageStatisticsHandler from "./handlers/statistics/get.js"
import workerPostHandler from "./handlers/worker/post.js"
import listPostHandler from "./handlers/list/post.js"
import listPutHandler from "./handlers/list/put.js"
import listHandler from "./handlers/list/get.js"
import listDeleteHandler from "./handlers/list/delete.js"
import { loginHandler, logoutHandler, loginCallbackHandler } from "./handlers/auth/get.js"
import { FastifyInstance, FastifyPluginOptions } from "fastify"

export default async function apiRoutes(fastify: FastifyInstance, _: FastifyPluginOptions) {
    // GET handlers
    fastify.get("/", indexHandler)
    fastify.get("/osv/:ecosystem/:name/:version", osvHandler)
    fastify.get("/list/:list", listHandler)
    fastify.get("/oauth2/login", loginHandler)
    fastify.get("/oauth2/callback", loginCallbackHandler)
    fastify.get("/oauth2/logout", logoutHandler)
    fastify.get("/statistics", packageStatisticsHandler)
    fastify.get("/audit", auditHandler)

    // POST handlers
    fastify.post("/list/:list", listPostHandler)
    fastify.post("/worker", workerPostHandler)

    // PUT handlers 
    fastify.put("/list/:list", listPutHandler)

    // DELETE handlers
    fastify.delete("/list/:list/:name", listDeleteHandler)
}
