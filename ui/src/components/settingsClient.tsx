'use client'
import { useState } from "react"

export default function SettingsClient({repositories}: {repositories: Repository[]}) {
    const [selectedRepo, setSelectedRepo] = useState<string>("")
    const [thresholds, setThresholds] = useState<{ [key: string]: number }>({})

    function handleRepoChange(repoKey: string) {
        setSelectedRepo(repoKey)
        if (!(repoKey in thresholds)) {
            setThresholds((prev) => ({ ...prev, [repoKey]: 5 }))
        }
    }

    function handleThresholdChange(repoKey: string, value: number) {
        setThresholds((prev) => ({ ...prev, [repoKey]: value }))
    }

    return (
        <main className="flex min-h-full flex-col items-center justify-center p-4">
            <h1 className="text-3xl font-bold text-blue-600">Settings</h1>
            <p className="mt-2 text-foreground">Adjust your library safety preferences.</p>

            {/* Ensure repositories are loaded before showing dropdown */}
            {repositories.length > 0 ? (
                <>
                    <div className="mt-6 w-80">
                        <label className="block text-foreground font-semibold">Select Repository:</label>
                        <select
                            className="w-full p-2 mt-2 border rounded"
                            value={selectedRepo}
                            onChange={(e) => handleRepoChange(e.target.value)}
                        >
                            {repositories.map((repo) => (
                                <option key={repo.key} value={repo.key}>
                                    {repo.key}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Threshold slider, only if a repository is selected */}
                    {selectedRepo && (
                        <div className="mt-6 w-80">
                            <label className="block text-foreground font-semibold">
                                Severity: {thresholds[selectedRepo]}
                            </label>
                            <input
                                type="range"
                                min="1"
                                max="10"
                                value={thresholds[selectedRepo]}
                                onChange={(e) => handleThresholdChange(selectedRepo, Number(e.target.value))}
                                className="w-full cursor-pointer"
                            />
                        </div>
                    )}
                </>
            ) : (
                <p className="mt-4 text-red-500">No repositories found.</p>
            )}
        </main>
    )
}
