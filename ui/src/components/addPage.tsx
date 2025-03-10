"use client"
import addPackage from "@/utils/filtering/addPackage"
import removePackage from "@/utils/filtering/removePackage"
import { SetStateAction, useEffect, useState } from "react"
import Trash from "./svg/trash"
import Pencil from "./svg/pencil"
import Edit from "./edit"
import "./addPage.css"
import { ECOSYSTEMS } from "@parent/constants"
import { getCookie } from "@/utils/cookies"

type PackageProps = {
    pkg: APIPackage
    list: 'whitelist' | 'blacklist'
    setPackages: (value: SetStateAction<APIPackage[]>) => void
    packages: APIPackage[]
}

function groupPackagesByEcosystem(packages: APIPackage[]) {
    const grouped: Record<string, APIPackage[]> = {}
    packages.forEach(pkg => {
        const ecosystem = Array.isArray(pkg.ecosystems) ? pkg.ecosystems.join(", ") : (pkg.ecosystems || "Other")
        if (!grouped[ecosystem]) {
            grouped[ecosystem] = []
        }
        grouped[ecosystem].push(pkg)
    })
    return grouped
}

export default function AddPage({ list, packages: serverPackages, repositories }: ClientPageProps) {
    const [packages, setPackages] = useState<APIPackage[]>([...serverPackages])
    const [selectedEcosystem, setSelectedEcosystem] = useState<string>("")
    const [showForm, setShowForm] = useState(false)
    const [searchTerm, setSearchTerm] = useState<string>("")
    const [selectedVersion, setSelectedVersion] = useState<string>("")
    const [showGlobalOnly, setShowGlobalOnly] = useState<boolean>(false)
    const [author, setAuthor] = useState<string | null>(null)
    const [newPackage, setNewPackage] = useState<AddPackage>({
        name: "",
        version: "",
        ecosystem: "",
        repository: null,
        comment: "",
        author: ""
    })

    useEffect(() => {
        const tempAuthor = getCookie('id')
        if (tempAuthor) {
            setAuthor(tempAuthor)
            setNewPackage({...newPackage, author: tempAuthor})
        }
    }, [])
    
    const allVersions = Array.from(
        new Set(
            packages
                .flatMap((p) => (Array.isArray(p.versions) ? p.versions : []))
                .filter(Boolean)
        )
    ).sort()

    const filtered = packages.filter((p) => {
        const nameMatches = p.name
            .toLowerCase()
            .includes(searchTerm.toLowerCase())

        const versionMatches =
            !selectedVersion ||
            (Array.isArray(p.versions) && p.versions.includes(selectedVersion))

        const ecosystemMatches =
            !selectedEcosystem ||
            (Array.isArray(p.ecosystems) &&
                p.ecosystems.includes(selectedEcosystem))

        const isGlobal =
                !p.repositories || (Array.isArray(p.repositories) && p.repositories.length === 0)
        const isLocal = !isGlobal
              
              
        const globalOrLocalMatch = showGlobalOnly ? isGlobal : isLocal

        return nameMatches && versionMatches && ecosystemMatches && globalOrLocalMatch
    })

    const groupedPackages = groupPackagesByEcosystem(filtered)
    
    const formStyle = "w-full mt-2 p-3 border border-dark rounded-md text-foreground focus:outline-hidden focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
    
    return (
        <main className="relative flex min-h-full flex-col items-center justify-center p-6">
            <h1 className="text-3xl font-bold text-blue-600">
                {list === "whitelist" ? "Whitelisted" : "Blacklisted"} Packages
            </h1>
            <p className="mt-2 text-foreground">
               Manage the list of{" "}
                {list === "whitelist" ? "safe" : "dangerous"} packages.
            </p>

            <select
                value={selectedEcosystem}
                onChange={(e) => setSelectedEcosystem(e.target.value)}
                className="select-repo w-1/8 mx-auto mt-2 p-1 border border-dark rounded text-sm text-foreground focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            >
                <option value="">All Ecosystems</option>
                {Object.keys(groupedPackages)
                    .sort()
                    .map((ecosystem) => (
                        <option key={ecosystem} value={ecosystem}>
                            {ecosystem}
                        </option>
                    ))}
            </select>

            <input
                type="text"
                placeholder="Search for a package..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="mt-4 p-2 border border-dark rounded ..."
            />

            <select
                value={selectedVersion}
                onChange={(e) => setSelectedVersion(e.target.value)}
                className="select-version w-1/8 mx-auto mt-2 p-1 border border-dark rounded text-sm text-foreground focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            >
                <option value="">All Versions</option>
                {allVersions.map((version) => (
                    <option key={version} value={version}>
                        {version}
                    </option>
                ))}
            </select>

            <div className="flex items-center justify-center">
                <label className="relative inline-flex items-center cursor-pointer">
                    <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={showGlobalOnly}
                        onChange={(e) => setShowGlobalOnly(e.target.checked)}
                    />
                    <div className="absolute inset-0 bg-gray-600 rounded-full" />

                    <div
                        className={`
                            absolute top-0 left-0 h-full w-1/2 rounded-full
                            bg-blue-500
                            transform transition-transform duration-300 ease-in-out
                            ${showGlobalOnly ? "translate-x-full" : "translate-x-0"}
                        `}
                    />
                    <div className="relative grid grid-cols-2 place-items-center h-full w-full px-2 text-white text-sm font-medium gap-4">
                        <div className="text-center">Local</div>
                        <div className="text-center">Global</div>
                    </div>
                </label>
            </div>
            <button
                onClick={() => {
                    if (!showForm) {
                        setShowForm(true)
                    }
                }}
                disabled={showForm}
                className={`mt-4 rounded-lg bg-blue-500 px-6 py-2 text-white hover:bg-blue-600 
                ${showForm ? "opacity-50 cursor-not-allowed" : ""}`}
            >
            + Add Package
            </button>

            {showForm && (
                <div
                    className="w-full h-full absolute left-0 top-0 grid place-items-center bg-black/80"
                    onClick={() => setShowForm(false)}
                >
                    <div
                        className="grid w-[35vw] bg-normal rounded-lg p-8 overflow-auto noscroll"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h2 className="text-lg font-semibold text-foreground">
                        Add New Package
                        </h2>
            
                        <input
                            type="text"
                            placeholder="Package Name"
                            value={newPackage.name}
                            onChange={(e) =>
                                setNewPackage({ ...newPackage, name: e.target.value })
                            }
                            className={`${formStyle} bg-[#333] text-white`}
                        />
                        <input
                            type="text"
                            placeholder="Version"
                            value={newPackage.version}
                            onChange={(e) =>
                                setNewPackage({ ...newPackage, version: e.target.value })
                            }
                            className={`${formStyle} bg-[#333] text-white`}
                        />
                        <select
                            value={newPackage.ecosystem || ""}
                            onChange={(e) =>
                                setNewPackage({ ...newPackage, ecosystem: e.target.value })
                            }
                            className={`${formStyle} bg-[#333] text-white`}
                        >
                            <option className="bg-[#333] text-white" value="">All Ecosystems</option>
                            {ECOSYSTEMS.map((ecosystem: string) => (
                                <option key={ecosystem} value={ecosystem}>
                                    {ecosystem}
                                </option>
                            ))}
                        </select>
                        <select
                            value={newPackage.repository || ""}
                            onChange={(e) =>
                                setNewPackage({ ...newPackage, repository: e.target.value })
                            }
                            className={`${formStyle} bg-[#333] text-white`}
                        >
                            <option className="bg-[#333] text-white" value="">All Repositories</option>
                            {repositories.map((repo) => (
                                <option
                                    key={`${repo.type}-${repo.key}`}
                                    value={repo.key}
                                >
                                [{repo.type}] {repo.key}
                                </option>
                            ))}
                        </select>
                        <textarea
                            placeholder="Reason"
                            value={newPackage.comment}
                            onChange={(e) =>
                                setNewPackage({ ...newPackage, comment: e.target.value })
                            }
                            className={`${formStyle} bg-[#333] text-white h-32`} 
                        />

                        <div className="mt-4 flex justify-between">
                            <button
                                onClick={() =>
                                    addPackage({
                                        newPackage,
                                        setPackages,
                                        setShowForm,
                                        setNewPackage,
                                        packages,
                                        list,
                                        author
                                    })
                                }
                                className="bg-green-500 px-4 py-2 rounded-md text-white hover:bg-green-600"
                            >
                            Add
                            </button>
                            <button
                                onClick={() => setShowForm(false)}
                                className="bg-red-500 px-4 py-2 rounded-md text-white hover:bg-red-600"
                            >
                            Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="mt-6 w-full">
                {Object.keys(groupedPackages).length === 0 ? (
                    <p className="text-foreground text-center">
                                   No {list === "whitelist" ? "whitelisted" : "blacklisted"} packages
                                   yet.
                    </p>
                ) : (
                    Object.keys(groupedPackages)
                        .sort()
                        .map((ecosystem) => (
                            <div key={ecosystem} className="mb-6 w-full">
                                <h2 className="text-xl font-bold text-blue-500">{ecosystem}</h2>
                                <ul
                                    className="grid gap-4 w-full"
                                    style={{
                                        display: "grid",
                                        gridTemplateColumns:
                                             "repeat(auto-fill, minmax(20%, 1fr))",
                                        justifyContent: "start",
                                        alignItems: "start",
                                        gap: "1rem",
                                        maxWidth: "100%",
                                    }}
                                >
                                    {groupedPackages[ecosystem].map((pkg) => (
                                        <Package
                                            key={pkg.name}
                                            pkg={pkg}
                                            list={list}
                                            setPackages={setPackages}
                                            packages={packages}
                                        />
                                    ))}
                                </ul>
                            </div>
                        ))
                )}
            </div>
        </main>
    )
}


function Package({ pkg, setPackages, packages, list }: PackageProps) {
    const [editing, setEditing] = useState(false)

    return (
        <li className="flex flex-col bg-background p-4 rounded-md shadow-sm border border-blue-500 min-w-100">
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
                {Array.isArray(pkg.comments) && pkg.comments.length ? `"${pkg.comments}"` : ""}
            </h1>
            <div className="self-end">
                <button onClick={() => setEditing(true)} className="h-[20px] w-[20px] self-end">
                    <Pencil fill="pencil-icon cursor-pointer" className="pencil-icon max-w-[16px] max-h-[16px] mb-[1.7px]" />
                </button>
                <button 
                    onClick={() => removePackage({ name: pkg.name, setPackages, packages, list })}
                    className="h-[20px] w-[20px] self-end"
                >
                    <Trash fill="fill-shallow hover:fill-red-500 cursor-pointer" className="w-full h-full" />
                </button>
            </div>
        </li>
    )
}
