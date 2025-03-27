import { FastifyReply, FastifyRequest } from "fastify"
import fetchOSV from "../utils/fetchOSV.js"

export default async function osvHandler(req: FastifyRequest, res: FastifyReply) {
    const { name, version, ecosystem } = req.params as OSVHandlerParams
    if (!name || !version || !ecosystem) {
        return res.status(400).send({ error: "Missing name, version, or ecosystem." })
    }

    const Name = decodeURIComponent(name)
    const Version = decodeURIComponent(version)

    try {
        console.log(`Fetching vulnerabilities: name=${Name}, version=${Version}, ecosystem=${ecosystem}`)

        const { response, osvLength } = await fetchOSV({name: Name, version: Version, ecosystem, clientAddress: req.ip})

        if (!osvLength && (!('whitelist' in response) && !('blacklist' in response))) {
            return res.send({})
        }
        return res.send(response)
    } catch (error) {
        console.error("Database error:", error)
        return res.status(500).send({ error: "Internal Server Error" })
    }
}
