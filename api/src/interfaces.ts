import { FastifyReply } from "fastify"

export interface FetchListProps {
    name: string
    version: string
    ecosystem: string
    res?: FastifyReply
}
