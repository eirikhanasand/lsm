import config from "@parent/constants"

const { DEFAULT_RESULTS_PER_PAGE } = config

type RepositoriesProps = {
    search?: string
    page?: string
    resultsPerPage?: string
}

type RepositoriesResProps = {
    result: Repository[]
    page: number
    pages: number
    resultsPerPage: number
    error?: string
}

/**
 * Fetches repositories from the API.
 * 
 * @param search Optional parameter to filter the results
 * @param page Page of the results (not used, unsuppored by JFrog Artifactory)
 * @param resultsPerPage Results per page (not used, unsuppored by JFrog Artifactory)
 * 
 * @returns Repositories from the API.
 */
export default async function fetchRepositories({ 
    search,
    page,
    resultsPerPage
}: RepositoriesProps): Promise<RepositoriesResProps> {
    try {
        const params = new URLSearchParams({ 
            search: search || '', 
            page: page || '1', 
            resultsPerPage: resultsPerPage || String(DEFAULT_RESULTS_PER_PAGE || 50),
        })
        const response = await fetch(`${process.env.NEXT_PUBLIC_API}/repositories?${params}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            },
        })

        if (!response.ok) {
            throw new Error(await response.text())
        }

        const data = response.json()
        return data
    } catch (error) {
        console.error(error)
        return {
            page: 1,
            pages: 1,
            result: [],
            resultsPerPage: Number(DEFAULT_RESULTS_PER_PAGE) || 50,
            error: `Failed to fetch repositories: ${error}`
        }
    }
}
