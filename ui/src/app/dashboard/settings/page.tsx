"use client"
import Section from "@/components/section"
import { useState } from "react"

export default function Settings() {
    const [threshold, setThreshold] = useState(5)

    return (
        <main className="flex min-h-full flex-col items-center justify-center p-4">
            <h1 className="text-3xl font-bold text-blue-600">Settings</h1>
            <p className="mt-2 text-foreground">Adjust your library safety preferences.</p>

            <div className="mt-6 w-80">
                <label className="block text-foreground font-semibold">Severity: {threshold}</label>
                <input
                    type="range"
                    min="1"
                    max="10"
                    value={threshold}
                    onChange={(e) => setThreshold(Number(e.target.value))}
                    className="w-full cursor-pointer"
                />
            </div>
            <Section text="Audit log" href="/dashboard/audit" />
        </main>
    )
}
