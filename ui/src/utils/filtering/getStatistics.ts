import { API } from '@constants'

export async function getStatistics({
    startTime, endTime
}: GetStatisticProps): Promise<StatisticResponse | null> {
    try {
        console.log(`Fetching statistics from ${startTime} to ${endTime}`)
        const params = new URLSearchParams({ startTime, endTime })
        const response = await fetch(`${API}/statistics?${params}`)

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
