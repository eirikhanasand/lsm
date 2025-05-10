import config from "@constants"

const { DEFAULT_RESULTS_PER_PAGE } = config

/**
 * 
 * @param startTime Earliest date to fetch results from.
 * @param endTime Last date to fetch results from.
 * @param page Page of the results to fetch.
 * @param resultsPerPage Number of results to fetch per page.
 * @returns Statistics as an object including `totalScanned`, 
 * `vulnerabilitiesFound`, `criticalBlocked`, `safeApproved`, `lastScan`, 
 * `repositoryStats`, `vulnerabilitiesOverTime`.
 */
export async function getStatistics({
    startTime,
    endTime,
    page,
    resultsPerPage
}: GetStatisticProps): Promise<StatisticResponse | null> {
    try {
        console.log(`Fetching statistics: startTime=${startTime} endTime=${endTime}, page=${page}, resultsPerPage=${resultsPerPage}`)
        const params = new URLSearchParams({ startTime, endTime, page: page || '1', resultsPerPage:  String(DEFAULT_RESULTS_PER_PAGE || 50) })
        const response = await fetch(`${process.env.NEXT_PUBLIC_API}/statistics?${params}`)

        if (!response.ok) {
            throw new Error(await response.text())
        }

        const data = await response.json()
        return data as StatisticResponse
    } catch (error) {
        console.error(error)
        return null
    }
}
