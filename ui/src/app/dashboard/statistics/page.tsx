import { getStatistics } from '@/utils/filtering/getStatistics'
import ClientPage from './clientPage'

const fallbackServerStats = {
    totalScanned: 0,
    vulnerabilitiesFound: 0,
    criticalBlocked: 0,
    safeApproved: 0,
    lastScan: 'Never',
    repositoryStats: [],
    vulnerabilitiesOverTime: []
}

export default async function page() {
    const startTime = '2020-01-01'
    const endTime = '2030-01-01'
    const serverStats = await getStatistics({ startTime, endTime })
    const stats = (serverStats || fallbackServerStats)
    const formattedServerStats = {
        ...stats,
        lastScan: stats.lastScan === 'Never' ? 'Never' : new Date(stats.lastScan).toLocaleString('no-NO'),
    }
    return <ClientPage
        serverStats={formattedServerStats}
        defaultStartTime={startTime}
        defaultEndTime={endTime}
    />
}
