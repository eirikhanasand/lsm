'use client'

import { useEffect, useState } from "react"
import {
    ActiveElement,
    CategoryScale,
    ChartEvent,
    Chart as ChartJS,
    ChartOptions,
    Legend,
    LinearScale,
    LineElement,
    PointElement,
    Title,
    Tooltip,
} from "chart.js"
import { getStatistics } from "@utils/filtering/getStatistics"
import { Line } from "react-chartjs-2"

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend)

type StatCardProps = {
    title: string
    value: string | number
}

type ChartData = {
    date: Date
    timestamp: string
    severity: number
    reason: string
    status: string
    repository: string
    ecosystem: string
}

type RepositoryData = {
    repository: string
    ecosystem: string
    scanned: number
    vulnerabilities: number
    blocked: number
    safe: number
}

type Data = {
    labels: string[]
    datasets: DataSet[]
}

type DataSet = {
    label: string
    data: number[]
    fill: boolean
    borderColor: string
    backgroundColor: string
}

type Summary = {
    totalScanned: number
    vulnerabilitiesFound: number
    criticalBlocked: number
    safeApproved: number
    lastScan: string | null
}

export default function Statistics() {
    const [summary, setSummary] = useState<Summary>({
        totalScanned: 500,
        vulnerabilitiesFound: 120,
        criticalBlocked: 45,
        safeApproved: 300,
        lastScan: "3.6.2025"
    })
    const [repositories, setRepositories] = useState<RepositoryData[]>([])
    const [startDate, setStartDate] = useState("2023-02-10")
    const [endDate, setEndDate] = useState("2026-02-14")
    const [expanded, setExpanded] = useState(false)
    const [selectedData, setSelectedData] = useState<ChartData | null>(null)
    const [data, setData] = useState<Data>({
        labels: [],
        datasets: []
    })
    const [loadedData, setLoadedData] = useState<ChartData[]>([])

    useEffect(() => {
        async function fetchStatistics() {
            try {
                const fetchedStats = await getStatistics({ timeStart: startDate, timeEnd: endDate })
                if (fetchedStats) {
                    console.log("Fetched stats:", fetchedStats)

                    setSummary({
                        criticalBlocked: 0,
                        lastScan: fetchedStats.lastScan,
                        safeApproved: fetchedStats.safeApproved,
                        vulnerabilitiesFound: fetchedStats.vulnerabilitiesFound,
                        totalScanned: fetchedStats.totalScanned,
                    })
                    setRepositories(fetchedStats.repositoryStats as RepositoryData[])

                    function normalizeDateStart(dateStr: string) {
                        const date = new Date(dateStr)
                        return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0)
                    }

                    function normalizeDateEnd(dateStr: string) {
                        const date = new Date(dateStr)
                        return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59)
                    }

                    const filteredValues = (fetchedStats.vulnerabilitiesOverTime as ChartData[])
                        .map((entry: ChartData) => {
                            const formattedTimestamp = convertToISOFormat(entry.timestamp)
                            entry.date = new Date(formattedTimestamp)
                            entry.severity = Math.floor(Math.random() * 10)
                            return entry
                        })
                        .filter((entry: ChartData) => {
                            const entryDate = entry.date
                            return entryDate >= normalizeDateStart(startDate) && entryDate <= normalizeDateEnd(endDate)
                        })

                    setLoadedData(filteredValues)
                    setData({
                        labels: filteredValues.map((entry) => entry.date.toLocaleDateString().replace(/\//g, '.')),
                        datasets: [
                            {
                                label: "Vulnerability Severity Over Time",
                                data: filteredValues.map((entry) => entry.severity),
                                fill: true,
                                borderColor: "#3b82f6",
                                backgroundColor: "rgba(59, 130, 246, 0.5)"
                            }
                        ]
                    })
                }
            } catch (error) {
                console.error("Error fetching statistics:", error)
            }
        }
        fetchStatistics()
    }, [startDate, endDate])

    const chartOptions: ChartOptions<"line"> = {
        responsive: true,
        plugins: {
            legend: { position: "top" },
            title: {
                display: true,
                text: "Vulnerability Severity Over Time"
            }
        },
        onClick: (_: ChartEvent, elements: ActiveElement[]) => {
            if (elements.length > 0) {
                const index = elements[0].index
                setSelectedData(loadedData[index])
            }
        }
    }

    return (
        <main className="flex min-h-full flex-col items-center justify-center p-6">
            <h1 className="text-3xl font-bold text-blue-600">Statistics</h1>
            <p className="mt-2 text-foreground text-center">
                Statistics surrounding package security. Check how many vulnerabilities were found and blocked.
            </p>

            {/* Date Range Picker */}
            <div className="mt-6 flex space-x-4">
                <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="border p-2 rounded border-blue-500"
                />
                <span className="self-center">to</span>
                <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="border p-2 rounded border-blue-500"
                />
            </div>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-3xl">
                <StatCard title="Total Dependencies Scanned" value={summary.totalScanned} />
                <StatCard title="Vulnerabilities Found" value={summary.vulnerabilitiesFound} />
                <StatCard title="Critical Vulnerabilities Blocked" value={summary.criticalBlocked} />
                <StatCard title="Safe Packages Approved" value={summary.safeApproved} />
                <StatCard
                    title="Last Scan Date"
                    value={summary.lastScan || 'Never'}
                />
            </div>

            <div className="mt-8 w-full max-w-3xl">
                <Line data={data} options={chartOptions}/>
            </div>

            {/* Popup Modal */}
            {selectedData && (
                <div className="fixed inset-0 flex items-center justify-center z-20">
                    <div className="absolute inset-0 bg-transparent" />
                    <div
                        className="bg-black shadow-lg rounded-lg p-4 text-center border border-blue-500 text-foreground z-30">
                        <h3 className="text-lg font-bold mb-4 text-white">
                            {selectedData.date.toLocaleDateString().replaceAll(/\//g, ".")}
                        </h3>
                        <p className="mb-2 text-white">
                            <strong>Severity Level:</strong> {selectedData.severity}
                        </p>
                        <p className="mb-4 text-white">
                            <strong>Repository:</strong>
                            {selectedData.repository}
                        </p>
                        <p className="mb-4 text-white">
                            <strong>Ecosystem:</strong>
                            {selectedData.ecosystem}
                        </p>
                        <p className="mb-4 text-white">
                            <strong>Status:</strong>
                            {selectedData.status}
                        </p>
                        <button
                            onClick={() => setSelectedData(null)}
                            className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}

            <div className="mt-8 w-full max-w-3xl">
                <button onClick={() => setExpanded(!expanded)} className="bg-blue-500 text-white py-2 px-4 rounded-lg">
                    {expanded ? "Hide Repository Stats" : "Show Repository Stats"}
                </button>
                {expanded && (
                    <div className="mt-4 space-y-4">
                        {repositories.map((repo, index) => (
                            <StatCard
                                key={index}
                                title={`Repository: ${repo.repository}, Ecosystem: ${repo.ecosystem}`}
                                value={`Scanned: ${repo.scanned}, Vulns: ${repo.vulnerabilities}, Blocked: ${repo.blocked}, Safe: ${repo.safe}`}
                            />
                        ))}
                    </div>
                )}
            </div>
        </main>
    )
}

function StatCard({title, value}: StatCardProps) {
    return (
        <div className="bg-color-normal shadow-lg rounded-lg p-4 text-center border border-blue-500 text-foreground">
            <h2 className="text-lg font-semibold text-color-bright">{title}</h2>
            <p className="text-2xl font-bold text-color-dark mt-2">{value}</p>
        </div>
    )
}

function convertToISOFormat(timestamp: string): string {
    return timestamp.replace(/(\d{4}-\d{2}-\d{2})-(\d{2})-(\d{2})-(\d{2})/, "$1T$2:$3:$4Z")
}
