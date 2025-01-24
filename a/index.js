import Fastify from "fastify"

const fastify = Fastify({
    logger: true
});

const schema = {
  schema: {
    response: {
      200: {
        type: 'object',
        properties: {
          hello: {
            type: 'string'
          }
        }
      }
    }
  }
}

fastify.get('/', schema, function (_req, reply) {
  reply.send({ hello: 'world' })
})

fastify.listen({ port: 8081, host: '0.0.0.0' })
