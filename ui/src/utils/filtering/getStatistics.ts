import {API} from "@constants";

type StatisticResponse = {
    totalScanned: number;
    vulnerabilitiesFound: number;
    criticalBlocked: number;
    safeApproved: number;
    lastScan: string;
    repositoryStats: Array<{
        repository: string;
        ecosystem: string;
        scanned: number;
        vulnerabilities: number;
        blocked: number;
        safe: number;
    }>;
    vulnerabilitiesOverTime: Array<{
        timestamp: string;
        severity: number;
        repository: string;
        ecosystem: string;
        reason: string;
    }>;
};

type GetStatisticProps = {
    timeStart: string;
    timeEnd: string;
}


export async function getStatistics({timeStart, timeEnd}: GetStatisticProps): Promise<StatisticResponse | null>  {
    try {
        const response = await fetch(`${API}/statistic/${timeStart}/${timeEnd}`)

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