import { FastifyReply, FastifyRequest } from "fastify"
import run from "../db.js"
import {fetchCVEs} from "../utils/fetchCVE.js";

export default async function cveHandler(req: FastifyRequest, res: FastifyReply) {
    const { name } = req.params as CVEHandlerParams
    return fetchCVEs(name, res)
}