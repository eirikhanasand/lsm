"use client"
import addPackage from "@/utils/filtering/addPackage"
import removePackage from "@/utils/filtering/removePackage"
import { Dispatch, SetStateAction, useEffect, useState } from "react"
import Trash from "./svg/trash"
import Pencil from "./svg/pencil"
import Edit from "./edit"
import "./addPage.css"
import { ECOSYSTEMS } from "@parent/constants"
import { getCookie } from "@/utils/cookies"
import Link from "next/link"
import groupPackagesByEcosystem from "@/utils/filtering/groupPackageByEcosystem"
import Dropdown from "./dropdown"

type PackageProps = {
    pkg: Package
    list: 'whitelist' | 'blacklist'
    setPackages: Dispatch<SetStateAction<Package[]>>
    packages: Package[]
    author: Author
    repositories: Repository[]
}

type PackagesProps = {
    groupedPackages: Record<string, Package[]>
    list: "whitelist" | "blacklist"
    setPackages: Dispatch<SetStateAction<Package[]>>
    packages: Package[]
    author: Author
    repositories: Repository[]
}

export default function AddPage({ list, packages: serverPackages, repositories }: ClientPageProps) {
    const [packages, setPackages] = useState<Package[]>([...serverPackages])
    const [selectedEcosystem, setSelectedEcosystem] = useState<string>("")
    const [showForm, setShowForm] = useState(false)
    const [searchTerm, setSearchTerm] = useState<string>("")
    const [selectedVersion, setSelectedVersion] = useState<string>("")
    const [showGlobalOnly, setShowGlobalOnly] = useState<boolean>(false)
    const [author, setAuthor] = useState<Author>({id: "", name: "", avatar: ""})
    const [newPackage, setNewPackage] = useState<AddPackage>({
        name: "",
        versions: [],
        ecosystems: [],
        repositories: [],
        comment: "",
        references: [],
        author: {
            id: "",
            name: "",
            avatar: ""
        }
    })

    useEffect(() => {
        const id = getCookie('id')
        const name = getCookie('user')
        const avatar = getCookie('avatar')
        if (id && name && avatar) {
            setAuthor({ id, name, avatar })
            setNewPackage({...newPackage, author: {id, name, avatar}})
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
        <main className="relative min-h-full">
            <div className="flex">
                <div className="p-6 w-1/2">
                    <h1 className="text-3xl font-bold text-blue-600">
                        {list === "whitelist" ? "Whitelisted" : "Blacklisted"} Packages
                    </h1>
                    <p className="mt-2 text-foreground">
                    Manage the list of{" "}
                        {list === "whitelist" ? "safe" : "dangerous"} packages.
                    </p>
                </div>

                <div className="w-full flex h-7 mt-6 mr-6 flex justify-end gap-4">
                    <select
                        value={selectedEcosystem}
                        onChange={(e) => setSelectedEcosystem(e.target.value)}
                        className="h-full select-repo p-1 border border-dark rounded text-sm text-foreground focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
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
                    <select
                        value={selectedVersion}
                        onChange={(e) => setSelectedVersion(e.target.value)}
                        className="h-full select-version p-1 border border-dark rounded text-sm text-foreground focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    >
                        <option value="">All Versions</option>
                        {allVersions.map((version) => (
                            <option key={version} value={version}>
                                {version}
                            </option>
                        ))}
                    </select>
                    <div className="h-full grid place-items-center">
                        <label className="h-full relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                className="sr-only peer"
                                checked={showGlobalOnly}
                                onChange={(e) => setShowGlobalOnly(e.target.checked)}
                            />
                            <div className="absolute inset-0 bg-gray-600 rounded-lg" />

                            <div
                                className={`
                                    absolute top-0 left-0 h-full w-1/2 rounded-lg
                                    bg-blue-500
                                    transform transition-transform duration-300 ease-in-out
                                    ${showGlobalOnly ? "translate-x-full" : "translate-x-0"}
                                `}
                            />
                            <div className="relative grid grid-cols-2 place-items-center px-2 text-white text-sm font-medium gap-4">
                                <div className="text-center">Local</div>
                                <div className="text-center">Global</div>
                            </div>
                        </label>
                    </div>
                    <input
                        type="text"
                        placeholder="Search for a package..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="h-full px-2 py-4 bg-dark rounded self-center text-white"
                    />
                </div>
            </div>
            <div className="fixed w-full h-full grid place-items-end top-0 pointer-events-none z-100">
                <button
                    onClick={() => {
                        if (!showForm) {
                            setShowForm(true)
                        }
                    }}
                    disabled={showForm}
                    className="w-40 h-10 rounded-lg relative bg-blue-500 px-6 py-2 text-white hover:bg-blue-600 right-6 bottom-6 pointer-events-auto z-1000"
                >
                    + Add Package
                </button>
            </div>

            {showForm && (
                <div
                    className="w-full h-full absolute left-0 top-0 grid place-items-center bg-black/80 z-1000"
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
                            className={`${formStyle} bg-light text-foreground`}
                        />
                        <input
                            type="text"
                            placeholder="Version"
                            value={newPackage.versions}
                            onChange={(e) =>
                                setNewPackage({ ...newPackage, versions: e.target.value.replaceAll(' ', '').split(',') })
                            }
                            className={`${formStyle} bg-light text-foreground`}
                        />
                        <Dropdown
                            className="mt-2"
                            item='ecosystems'
                            items={newPackage.ecosystems} 
                            allItems={ECOSYSTEMS} 
                            setItems={(items) => setNewPackage({ ...newPackage, ecosystems: items })}
                        />
                        <Dropdown
                            className="mt-2"
                            item='repositories'
                            items={newPackage.repositories} 
                            allItems={repositories.map((repository) => `[${repository.type}] ${repository.key}`)} 
                            setItems={(items) => setNewPackage({ ...newPackage, repositories: items })}
                        />
                        <input
                            type="text"
                            placeholder="Reference"
                            value={newPackage.references}
                            onChange={(e) =>
                                setNewPackage({ ...newPackage, references: e.target.value.replaceAll(' ', '').split(',') })
                            }
                            className={`${formStyle} bg-light text-foreground`}
                        />
                        <textarea
                            placeholder="Reason"
                            value={newPackage.comment}
                            onChange={(e) =>
                                setNewPackage({ ...newPackage, comment: e.target.value })
                            }
                            className={`${formStyle} bg-light text-foreground h-32`} 
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

            <div className="w-full px-6">
                {Object.keys(groupedPackages).length === 0 ? (
                    <p className="text-foreground text-center">
                                   No {list === "whitelist" ? "whitelisted" : "blacklisted"} packages
                                   yet.
                    </p>
                ) : (
                    <div>
                        <PackageHeader />
                        <Packages 
                            groupedPackages={groupedPackages} 
                            list={list}
                            setPackages={setPackages}
                            packages={packages}
                            author={author}
                            repositories={repositories}
                        />
                    </div>
                )}
            </div>
        </main>
    )
}

function PackageHeader() {
    return (
        <div className="grid grid-cols-12 w-full h-8 rounded-lg px-4 items-center border border-blue-500">
            <h1 className="col-span-2">Name</h1>
            <h1>Ecosystems</h1>
            <h1>Repositories</h1>
            <h1>Versions</h1>
            <div className="flex col-span-7 w-full">
                <h1 className="w-103.5">Comment</h1>
                <h1 className="w-44">Created</h1>
                <h1 className="w-44">Updated</h1>
                <h1 className="w-20">Revision</h1>
            </div>
        </div>
    )
}

function Packages({groupedPackages, list, setPackages, packages, author, repositories}: PackagesProps) {
    return Object.keys(groupedPackages)
        .sort()
        .map((ecosystem) => (
            <div key={ecosystem} className="w-full">
                <h2 className="text-xl font-bold text-blue-500">{ecosystem}</h2>
                <ul
                    className="grid gap-4 w-full"
                >
                    {groupedPackages[ecosystem].map((pkg) => (
                        <Package
                            key={pkg.name}
                            pkg={pkg}
                            list={list}
                            setPackages={setPackages}
                            packages={packages}
                            author={author}
                            repositories={repositories}
                        />
                    ))}
                </ul>
            </div>
        ))
}

function Package({ pkg, setPackages, packages, list, author, repositories }: PackageProps) {
    const [editing, setEditing] = useState(false)
    const [createdDate, setCreatedDate] = useState("")
    const [updatedDate, setUpdatedDate] = useState("")

    useEffect(() => {
        setCreatedDate(new Date(pkg.created.time).toLocaleString())
        setUpdatedDate(new Date(pkg.updated.time).toLocaleString())
    }, [pkg])

    return (
        <li className="relative grid grid-cols-12 bg-background p-4 rounded-md shadow-sm border border-blue-500 min-w-100">
            {editing && <Edit 
                pkg={pkg}
                setEditing={setEditing}
                list={list}
                packages={packages}
                setPackages={setPackages}
                repositories={repositories}
                author={author}
            />}
            <h1 className="text-sm text-foreground font-semibold text-wrap break-all col-span-2">
                {pkg.name}
            </h1>
            <h1 className="text-sm text-foreground">
                {Array.isArray(pkg.repositories) && pkg.repositories.length ? pkg.repositories : "Global"}
            </h1>
            <h1 className="text-sm text-foreground">{pkg.ecosystems}</h1>
            <h1 className="text-sm text-foreground font-semibold">
                {pkg.versions.join(', ')}
            </h1>
            <div className="flex col-span-7 gap-4">
                <h1 className="text-sm text-shallow italic col-span-4 pr-2 w-100">
                    {pkg.comment || ""}
                </h1>
                <h1 className="text-sm text-shallow w-40">
                    {createdDate}
                </h1>
                <h1 className="text-sm text-shallow w-40">
                    {updatedDate}
                </h1>
                <h1 className="text-sm text-shallow w-20">
                    {pkg.changeLog.length}
                </h1>
            </div>
            <div className="absolute right-4 mt-3.5 flex">
                <div className="mr-[2.5px]">
                    {pkg.references && pkg.references.length > 1 
                        ? <div className="relative group inline-block">
                            <Link href={pkg.references[0]} className="info-icon border border-shallow px-[6.6px] rounded-full mb-5 text-shallow">i</Link>

                            <div className="grid absolute right-0 hidden w-100 bg-light p-2 border border-blue-500 rounded group-hover:grid group-hover:grid-cols-1">
                                {pkg.references.map((reference) => <Link key={reference} href={reference} className="text-blue-300">{reference}</Link>)}
                            </div>
                        </div> 
                        : <Link href={pkg.references[0]} className="info-icon border border-shallow px-[6.6px] rounded-full mb-5 text-shallow cursor-pointer hover:border-blue-500 hover:text-foreground">i</Link>}
                </div>
                <button onClick={() => setEditing(true)} className="h-[20px] w-[20px] self-end mb-[4px]">
                    <Pencil fill="pencil-icon cursor-pointer" className="pencil-icon max-w-[16px] max-h-[16px]" />
                </button>
                <button 
                    onClick={() => removePackage({ name: pkg.name, setPackages, packages, list })}
                    className="h-[20px] w-[20px] self-end mb-[4.2px]"
                >
                    <Trash fill="fill-shallow hover:fill-red-500 cursor-pointer" className="w-full h-full" />
                </button>
            </div>
        </li>
    )
}
