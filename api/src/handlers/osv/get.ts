import { FastifyReply, FastifyRequest } from 'fastify'
import fetchOSV from '../../utils/fetchOSV.js'

/**
 * Fetches the vulnerabilities for a package from OSV. The request is passed on
 * to `fetchOSV`, which determines whether to fetch the local or remote database,
 * and returns the result from the query.
 * 
 * Required parameters: `name`, `version`, `ecosystem`
 * 
 * @param req Incoming Fastify Request
 * @param res Outgoing Fastify Response
 * 
 * @returns Fastify Response
 */
export default async function osvHandler(req: FastifyRequest, res: FastifyReply) {
    const { name, version, ecosystem } = req.params as OSVHandlerParams
    if (!name || !version || !ecosystem) {
        return res.status(400).send({ error: 'Missing name, version, or ecosystem.' })
    }

    const Name = decodeURIComponent(name)
    const Version = decodeURIComponent(version)

    try {
        console.log(
            `Fetching vulnerabilities:` +
            ` name=${Name},` +
            ` version=${Version},` +
            ` ecosystem=${ecosystem}`
        )

        const osv = await fetchOSV({
            name: Name,
            version: Version,
            ecosystem,
            clientAddress: req.ip
        })
        if ('error' in osv) {
            return res.send({ error: osv.error })
        }

        // Checks if results are found, and otherwise returns an empty object.
        const { response, osvLength } = osv
        if (!osvLength && (!('allow' in response) && !('block' in response))) {
            return res.send({})
        }
        return res.send(response)
    } catch (error) {
        console.error(`Database error: ${JSON.stringify(error)}`)
        return res.status(500).send({ error: 'Internal Server Error' })
    }
}
