import { FastifyReply, FastifyRequest } from "fastify"
import config from "../../constants.js"

const { JFROG_ID, JFROG_TOKEN, DEFAULT_RESULTS_PER_PAGE } = config

type Repositories = {
    page: number
    pages: number
    result: Repository[]
    resultsPerPage: number
    error?: string
}

type RepositoryQuery = {
    search: string
}

/**
 * Fetches repositories from JFrog Artifactory.
 * 
 * Optional query parameter: `search`
 * 
 * @param req Incoming Fastify Request
 * @param res Outgoing Fastify Response
 * 
 * @returns Fastify Response
 */
export default async function repositoryHandler(req: FastifyRequest, res: FastifyReply): Promise<Repositories> {
    const { search } = req.query as RepositoryQuery
    try {
        // Paging is ready but unimplemented because JFrog doesnt support it yet.
        const response = await fetch(`https://${JFROG_ID}.jfrog.io/artifactory/api/repositories`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${JFROG_TOKEN}`
            },
        })

        if (!response.ok) {
            throw new Error(await response.text())
        }

        // Search filter
        const data: Repository[] = (await response.json()).filter((repository: Repository) => repository.key.includes(search))
        return {
            page: 1,
            pages: 1,
            result: data,
            resultsPerPage: Number(DEFAULT_RESULTS_PER_PAGE) || 50,
        }
    } catch (error) {
        console.error(error)
        return {
            page: 1,
            pages: 1,
            result: [],
            resultsPerPage: Number(DEFAULT_RESULTS_PER_PAGE) || 50,
            error: `Failed to fetch repositories. Something went wrong in JFrog Artifactory: ${JSON.stringify(error)}`
        }
    }
}
