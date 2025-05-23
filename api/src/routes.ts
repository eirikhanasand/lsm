import indexHandler from './handlers/index.js'
import repositoryHandler from './handlers/repositories/get.js'
import osvHandler from './handlers/osv/get.js'
import auditHandler from './handlers/audit/get.js'
import packageStatisticsHandler from './handlers/statistics/get.js'
import workerPostHandler from './handlers/worker/post.js'
import listPostHandler from './handlers/list/post.js'
import listPutHandler from './handlers/list/put.js'
import listHandler from './handlers/list/get.js'
import listDeleteHandler from './handlers/list/delete.js'
import { loginHandler, loginCallbackHandler } from './handlers/auth/get.js'
import { FastifyInstance, FastifyPluginOptions } from 'fastify'

/**
 * Defines the routes available in the API.
 * 
 * @param fastify Fastify Instance
 * @param _ Fastify Plugin Options
 */
export default async function apiRoutes(fastify: FastifyInstance, _: FastifyPluginOptions) {
    // Index handler
    fastify.get('/', indexHandler)

    // Repository handler
    fastify.get('/repositories', repositoryHandler)

    // OSV handler
    fastify.get('/osv/:ecosystem/:name/:version', osvHandler)

    // List handlers
    fastify.get('/list/:list', listHandler)

    fastify.post('/list/:list', listPostHandler)
    fastify.post('/worker', workerPostHandler)

    fastify.put('/list/:list', listPutHandler)

    fastify.delete('/list/:list/:name', listDeleteHandler)

    // Login handlers
    fastify.get('/oauth2/login', loginHandler)
    fastify.get('/oauth2/callback', loginCallbackHandler)

    // Statistics handler
    fastify.get('/statistics', packageStatisticsHandler)

    // Log handler
    fastify.get('/audit', auditHandler)
}
