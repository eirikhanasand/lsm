import Fastify from 'fastify'
import apiRoutes from './routes.js'
import cors from '@fastify/cors'

const fastify = Fastify({
    logger: true
})

fastify.register(cors, {
    origin: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'HEAD']
})

fastify.register(apiRoutes, { prefix: "/api" })

async function start() {
    try {
        await fastify.listen({ port: 8081, host: '0.0.0.0' })
    } catch (err) {
        fastify.log.error(err)
        process.exit(1)
    }
}

start()
