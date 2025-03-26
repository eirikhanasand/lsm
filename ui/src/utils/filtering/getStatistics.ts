import { API } from "@constants"

export async function getStatistics({timeStart, timeEnd}: GetStatisticProps): Promise<StatisticResponse | null>  {
    try {
        console.log(timeStart, timeEnd)
        const response = await fetch(`${API}/statistics/${timeStart}/${timeEnd}`)

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
