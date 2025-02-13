"use client"
import addPackage from "@/utils/filtering/addPackage"
import removePackage from "@/utils/filtering/removePackage"
import { useState } from "react"

export default function WhitelistedPackages() {
    const [packages, setPackages] = useState<Package[]>([])
    const [showForm, setShowForm] = useState(false)
    const [newPackage, setNewPackage] = useState<Package>({
        id: 0,
        name: "",
        version: "",
        ecosystem: "",
        comment: "",
    })

    return (
        <main className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-6">
            <h1 className="text-3xl font-bold text-blue-600">Whitelisted Packages</h1>
            <p className="mt-2 text-gray-700">Manage the list of safe packages.</p>

            {!showForm && (
                <button
                    onClick={() => setShowForm(true)}
                    className="mt-4 rounded-lg bg-blue-500 px-6 py-2 text-white hover:bg-blue-600"
                >
                    + Add Package
                </button>
            )}

            {showForm && (
                <div className="mt-4 w-96 bg-white p-4 rounded-lg shadow-md border border-gray-300">
                    <h2 className="text-lg font-semibold text-gray-700">Add New Package</h2>
                    <input
                        type="text"
                        placeholder="Package Name"
                        value={newPackage.name}
                        onChange={(e) => setNewPackage({ ...newPackage, name: e.target.value })}
                        className="w-full mt-2 p-3 border border-gray-500 rounded-md text-gray-900 focus:outline-hidden focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                        type="text"
                        placeholder="Version"
                        value={newPackage.version}
                        onChange={(e) => setNewPackage({ ...newPackage, version: e.target.value })}
                        className="w-full mt-2 p-3 border border-gray-500 rounded-md text-gray-900 focus:outline-hidden focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                        type="text"
                        placeholder="Ecosystem (e.g., npm, pip, maven)"
                        value={newPackage.ecosystem}
                        onChange={(e) => setNewPackage({ ...newPackage, ecosystem: e.target.value })}
                        className="w-full mt-2 p-3 border border-gray-500 rounded-md text-gray-900 focus:outline-hidden focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                    />
                    <textarea
                        placeholder="Comment / Reasoning"
                        value={newPackage.comment}
                        onChange={(e) => setNewPackage({ ...newPackage, comment: e.target.value })}
                        className="w-full mt-2 p-3 border border-gray-500 rounded-md text-gray-900 focus:outline-hidden focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                    />
                    <div className="mt-4 flex justify-between">
                        <button 
                            onClick={() => addPackage({newPackage, setPackages, setShowForm, setNewPackage, packages})} 
                            className="bg-green-500 px-4 py-2 rounded-md text-white hover:bg-green-600"
                        >
                            Add
                        </button>
                        <button onClick={() => setShowForm(false)} className="bg-red-500 px-4 py-2 rounded-md text-white hover:bg-red-600">
                            Cancel
                        </button>
                    </div>
                </div>
            )}

            <ul className="mt-6 w-96">
                {packages.length === 0 ? (
                    <p className="text-gray-500 text-center">No whitelisted packages yet.</p>
                ) : (
                    packages.map((pkg) => (
                        <li key={pkg.id} className="flex flex-col bg-white p-4 my-2 rounded-md shadow-sm border border-gray-200">
                            <div className="text-lg font-semibold text-gray-700">{pkg.name} ({pkg.version})</div>
                            <div className="text-sm text-gray-500">{pkg.ecosystem}</div>
                            <div className="text-sm text-gray-600 italic mt-1">&quot;{pkg.comment}&quot;</div>
                            <button
                                onClick={() => removePackage({id: pkg.id, setPackages, packages})}
                                className="mt-2 text-red-500 hover:underline self-end"
                            >
                                Remove
                            </button>
                        </li>
                    ))
                )}
            </ul>
        </main>
    )
}
