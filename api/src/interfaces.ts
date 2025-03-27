import { FastifyReply } from "fastify"

export interface FetchListProps {
    name: string
    version: string
    ecosystem: string
    res?: FastifyReply
}

export enum DownloadStatus {
    DOWNLOAD_UNSPECIFIED = 0,
    DOWNLOAD_PROCEED = 1,
    DOWNLOAD_STOP = 2,
    DOWNLOAD_WARN = 3,
    UNRECOGNIZED = -1
}
