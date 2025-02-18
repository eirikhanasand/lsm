"use client"
import addPackage from "@/utils/filtering/addPackage"
import removePackage from "@/utils/filtering/removePackage"
import { SetStateAction, useState } from "react"
import Trash from "./svg/trash"
import Pencil from "./svg/pencil"
import Edit from "./edit"
import "./addPage.css"

type PackageProps = {
    pkg: APIPackage
    list: 'whitelist' | 'blacklist'
    setPackages: (value: SetStateAction<APIPackage[]>) => void
    packages: APIPackage[]
}

export default function AddPage({list, packages: serverPackages}: ClientPageProps) {
    const [packages, setPackages] = useState<APIPackage[]>([...serverPackages])
    const [showForm, setShowForm] = useState(false)
    const formStyle = "w-full mt-2 p-3 border border-dark rounded-md text-foreground focus:outline-hidden focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
    const [newPackage, setNewPackage] = useState<Package>({
        name: "",
        version: "",
        ecosystem: "",
        repository: null,
        comment: "",
    })

    return (
        <main className="flex min-h-full flex-col items-center justify-center p-6">
            <h1 className="text-3xl font-bold text-blue-600">{list === 'whitelist' ? "Whitelisted" : "Blacklisted"} Packages</h1>
            <p className="mt-2 text-foreground">Manage the list of {list === 'whitelist' ? "safe" : "dangerous"} packages.</p>

            {!showForm && (
                <button
                    onClick={() => setShowForm(true)}
                    className="mt-4 rounded-lg bg-blue-500 px-6 py-2 text-white hover:bg-blue-600"
                >
                    + Add Package
                </button>
            )}

            {showForm && (
                <div className="mt-4 w-96 bg-background p-4 rounded-lg shadow-md border border-dark">
                    <h2 className="text-lg font-semibold text-foreground">Add New Package</h2>
                    <input
                        type="text"
                        placeholder="Package Name"
                        value={newPackage.name}
                        onChange={(e) => setNewPackage({ ...newPackage, name: e.target.value })}
                        className={formStyle}
                    />
                    <input
                        type="text"
                        placeholder="Version"
                        value={newPackage.version}
                        onChange={(e) => setNewPackage({ ...newPackage, version: e.target.value })}
                        className={formStyle}
                    />
                    <input
                        type="text"
                        placeholder="Ecosystem (e.g., npm, pip, maven)"
                        value={newPackage.ecosystem}
                        onChange={(e) => setNewPackage({ ...newPackage, ecosystem: e.target.value })}
                        className={formStyle}
                    />
                    <input
                        type="text"
                        placeholder="Artifactory Repository (or leave empty for all)"
                        value={newPackage.repository || ""}
                        onChange={(e) => setNewPackage({ ...newPackage, repository: e.target.value })}
                        className={formStyle}
                    />
                    <textarea
                        placeholder="Reason"
                        value={newPackage.comment}
                        onChange={(e) => setNewPackage({ ...newPackage, comment: e.target.value })}
                        className={formStyle}
                    />
                    <div className="mt-4 flex justify-between">
                        <button 
                            onClick={() => addPackage({newPackage, setPackages, setShowForm, setNewPackage, packages, list:'whitelist'})}
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
                    <p className="text-foreground text-center">No {list === 'whitelist' ? "whitelisted" : "blacklisted"} packages yet.</p>
                ) : (
                    packages.map((pkg: APIPackage) => <Package 
                        key={pkg.name}
                        pkg={pkg}
                        list={list}
                        setPackages={setPackages}
                        packages={packages}
                    />)
                )}
            </ul>
        </main>
    )
}

function Package({pkg, setPackages, packages, list}: PackageProps) {
    const [editing, setEditing] = useState(false)

    return (
        <li className="flex flex-col bg-background p-4 my-2 rounded-md shadow-sm border border-blue-500">
            {editing && <Edit 
                pkg={pkg}
                setEditing={setEditing}
                list={list}
                packages={packages}
                setPackages={setPackages}
            />}
            <div className="text-lg text-foreground flex justify-between">
                <h1 className="text-sm text-foreground font-semibold">
                    {pkg.name} ({pkg.versions})
                </h1>
                <h1 className="text-sm text-foreground">
                    {Array.isArray(pkg.repositories) && pkg.repositories.length ? pkg.repositories : "Global"}
                </h1>
            </div>
            <h1 className="text-sm text-foreground">{pkg.ecosystems}</h1>
            <h1 className="text-sm text-shallow italic mt-1">
                {Array.isArray(pkg.repositories) && pkg.repositories.length ? `"${pkg.comments}"` : ""}
            </h1>
            <div className="self-end">
                <button
                    onClick={(() => setEditing(true))}
                    // onClick={() => editPackage({pkg, setPackages, packages, list})}
                    className="h-[20px] w-[20px] self-end"
                >
                    <Pencil
                        fill="pencil-icon cursor-pointer" 
                        className="pencil-icon max-w-[16px] max-h-[16px] mb-[1.7px]"
                    />
                </button>
                <button
                    onClick={() => removePackage({name: pkg.name, setPackages, packages, list})}
                    className="h-[20px] w-[20px] self-end"
                >
                    <Trash fill="fill-shallow hover:fill-red-500 cursor-pointer" className="w-full h-full" />
                </button>
            </div>
        </li>
    )
}
