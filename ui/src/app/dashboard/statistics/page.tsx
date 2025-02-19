'use client'
import { useState } from "react"
// import { Line } from "react-chartjs-2"
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from "chart.js"

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend)

type StatCardProps = {
    title: string
    value: string | number
}

export default function Statistics() {
    // const [stats, setStats] = useState([
    // eslint-disable-next-line
    const [stats, _] = useState([
        { timestamp: "2024-02-10", severity: 1 },
        { timestamp: "2024-02-11", severity: 5 },
        { timestamp: "2024-02-12", severity: 3 },
        { timestamp: "2024-02-13", severity: 10 },
        { timestamp: "2024-02-14", severity: 4 },
    ])

    // const [summary, setSummary] = useState({
    // eslint-disable-next-line
    const [summary, __] = useState({
        totalScanned: 500,
        vulnerabilitiesFound: 120,
        criticalBlocked: 45,
        safeApproved: 300,
        lastScan: "2024-02-14",
    })

    // const [repositories, setRepositories] = useState([
    // eslint-disable-next-line
    const [repositories, ___] = useState([
        { name: "Repo A", scanned: 120, vulnerabilities: 30, blocked: 10, safe: 80 },
        { name: "Repo B", scanned: 200, vulnerabilities: 50, blocked: 20, safe: 130 },
        { name: "Repo C", scanned: 180, vulnerabilities: 40, blocked: 15, safe: 125 },
    ])

    const [startDate, setStartDate] = useState("2024-02-10")
    const [endDate, setEndDate] = useState("2024-02-14")
    const [expanded, setExpanded] = useState(false)
    const [selectedData, setSelectedData] = useState(null)

    // Filter stats based on selected date range
    // const filteredStats = stats.filter((entry) => {
    //     const entryDate = new Date(entry.timestamp)
    //     const start = new Date(startDate)
    //     const end = new Date(endDate)
    //     return entryDate >= start && entryDate <= end
    // })

    // const data = {
    //     labels: filteredStats.map((entry) => new Date(entry.timestamp).toLocaleDateString().replaceAll(/\//g, '.')),
    //     datasets: [
    //         {
    //             label: "Vulnerability Severity Over Time",
    //             data: filteredStats.map((entry) => entry.severity), // Y-axis as severity
    //             borderColor: "#ef4444",
    //             backgroundColor: "rgba(239, 68, 68, 0.5)",
    //             fill: true,
    //         },
    //     ],
    // }

    // const chartOptions = {
    //     responsive: true,
    //     plugins: {
    //         legend: { position: 'top' },
    //         title: {
    //             display: true,
    //             text: "Vulnerability Severity Over Time"
    //         }
    //     },
    //     onClick: (e: any, elements: any) => {
    //         if (elements.length > 0) {
    //             const index = elements[0].index
    //             // setSelectedData(filteredStats[index])
    //         }
    //     }
    // }

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
                <span>to</span>
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
                <StatCard title="Last Scan Date" value={new Date().toLocaleDateString().replaceAll(/\//g, '.')} />
            </div>

            <div className="mt-8 w-full max-w-3xl">
                {/* <Line data={data} options={chartOptions} /> */}
            </div>

            {/* Popup Modal */}
            {selectedData && (
                <div className="fixed inset-0 flex items-center justify-center z-20">
                    <div className="absolute inset-0 bg-transparent" />
                    <div className="bg-black shadow-lg rounded-lg p-4 text-center border border-blue-500 text-foreground z-30">
                        <h3 className="text-lg font-bold mb-4 text-white">
                            {/* Details for {new Date(selectedData.timestamp).toLocaleDateString().replaceAll(/\//g, '.')} */}
                        </h3>
                        <p className="mb-2 text-white">
                            {/* <strong>Severity Level:</strong> {selectedData.severity} */}
                        </p>
                        <p className="mb-2 text-white">
                            {/* <strong>Vulnerabilities Detected:</strong> {selectedData.severity * 5} */}
                        </p>
                        <p className="mb-4 text-white">
                            <strong>Action Taken:</strong>
                            {/* {selectedData.severity > 5 ? " Blocked" : " Reviewed"} */}
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
                        {repositories.map((repo, index) =>
                            <StatCard 
                                key={index}
                                title={repo.name}
                                value={`Scanned: ${repo.scanned}, Vulns: ${repo.vulnerabilities}, Blocked: ${repo.blocked}, Safe: ${repo.safe}`}
                            />
                        )}
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
