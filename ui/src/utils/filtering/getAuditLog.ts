import config from '@constants'

const { SERVER_API, DEFAULT_RESULTS_PER_PAGE } = config

type AuditLogProps = {
    side: 'client' | 'server'
    page?: string
    resultsPerPage?: string
    search?: string
}

/**
 * Fetches results from the audit log
 * @param side Whether the call to this function occurs on the `client` or `server` side.
 * @param page Page of the results to query
 * @param resultsPerPage Amount of results to include per page
 * @param search Optional string to filter the results
 * @returns Returns the audit log entries matching the given input
 */
export default async function getAuditLog({side, page, resultsPerPage, search}: AuditLogProps) {
    try {
        console.log(`Fetching audit log: side=${side} page=${page}, resultsPerPage=${resultsPerPage}, search=${search}`)
        const params = new URLSearchParams({ 
            page: page || '1',
            resultsPerPage:  resultsPerPage || String(DEFAULT_RESULTS_PER_PAGE || 50),
            search: search || ''
        })
        const response = await fetch(`${side === 'server' ? SERVER_API : process.env.NEXT_PUBLIC_API}/audit?${params}`)

        if (!response.ok) {
            throw new Error(await response.text())
        }

        const data = await response.json()
        return data
    } catch (error) {
        console.error(error)
        return 500
    }
}
