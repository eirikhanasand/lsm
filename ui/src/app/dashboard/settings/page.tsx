"use client"
import { useState } from "react"

export default function Settings() {
    const [threshold, setThreshold] = useState(5)

    return (
        <main className="flex min-h-screen flex-col items-center justify-center bg-white p-4">
            <h1 className="text-3xl font-bold text-blue-600">Settings</h1>
            <p className="mt-2 text-gray-700">Adjust your library safety preferences.</p>

            <div className="mt-6 w-80">
                <label className="block text-gray-700 font-semibold">Severity: {threshold}</label>
                <input
                    type="range"
                    min="1"
                    max="10"
                    value={threshold}
                    onChange={(e) => setThreshold(Number(e.target.value))}
                    className="w-full cursor-pointer"
                />
            </div>
        </main>
    )
}
