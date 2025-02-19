import { FastifyReply } from "fastify"

export type FetchListProps = {
    name: string
    version: string
    ecosystem: string
    res?: FastifyReply
}
