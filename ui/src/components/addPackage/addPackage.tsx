'use client'
import { useEffect, useState } from 'react'
import { getCookie } from '@/utils/cookies'
import groupPackagesByEcosystem from '@/utils/filtering/groupPackageByEcosystem'
import Form from './form'
import Packages from './packages'
import Header from './header'
import './addPackage.css'

export default function AddPackage({
    list,
    packages: serverPackages,
    repositories,
    serverShowGlobalOnly
}: ClientPageProps) {
    const [packages, setPackages] = useState<Package[]>([...serverPackages])
    const [selectedEcosystem, setSelectedEcosystem] = useState<string>('')
    const [showForm, setShowForm] = useState(false)
    const [searchTerm, setSearchTerm] = useState<string>('')
    const [selectedVersion, setSelectedVersion] = useState<string>('')
    const [showGlobalOnly, setShowGlobalOnly] = useState<boolean>(serverShowGlobalOnly)
    const [author, setAuthor] = useState<Author>({ id: '', name: '', avatar: '' })
    const [newPackage, setNewPackage] = useState<AddPackage>({
        name: '',
        comment: '',
        versions: [],
        ecosystems: [],
        repositories: [],
        references: [],
        author: {
            id: '',
            name: '',
            avatar: ''
        }
    })

    useEffect(() => {
        const id = getCookie('id')
        const name = getCookie('user')
        const avatar = getCookie('avatar')
        if (id && name && avatar) {
            setAuthor({ id, name, avatar })
            setNewPackage({ ...newPackage, author: { id, name, avatar } })
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
            (Array.isArray(p.ecosystems) && p.ecosystems.includes(selectedEcosystem))

        const isGlobal = !p.repositories || (Array.isArray(p.repositories) && p.repositories.length === 0)
        const isLocal = !isGlobal
        const globalOrLocalMatch = showGlobalOnly ? isGlobal : isLocal

        return nameMatches && versionMatches && ecosystemMatches && globalOrLocalMatch
    })

    const groupedPackages = groupPackagesByEcosystem(filtered)
    const formStyle = 'w-full mt-2 p-3 border border-dark rounded-md text-foreground focus:outline-hidden focus:border-blue-500 focus:ring-2 focus:ring-blue-500'

    return (
        <main className='relative min-h-full'>
            <Header
                list={list}
                selectedEcosystem={selectedEcosystem}
                setSelectedEcosystem={setSelectedEcosystem}
                groupedPackages={groupedPackages}
                selectedVersion={selectedVersion}
                setSelectedVersion={setSelectedVersion}
                allVersions={allVersions}
                showGlobalOnly={showGlobalOnly}
                setShowGlobalOnly={setShowGlobalOnly}
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                showForm={showForm}
                setShowForm={setShowForm}
            />

            <Form
                showForm={showForm}
                setShowForm={setShowForm}
                newPackage={newPackage}
                setNewPackage={setNewPackage}
                formStyle={formStyle}
                repositories={repositories}
                setPackages={setPackages}
                list={list}
                author={author}
                packages={packages}
            />

            <div className='w-full px-6'>
                {Object.keys(groupedPackages).length === 0 ? (
                    <p className='text-foreground text-center'>
                        No {list}listed packages yet.
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
        <div className='grid grid-cols-12 w-full h-8 rounded-lg px-4 items-center border border-blue-500'>
            <div className='flex col-span-4 w-full'>
                <h1 className='w-full'>Name</h1>
                <h1 className='w-full'>Ecosystems</h1>
                <h1 className='w-full'>Repositories</h1>
            </div>
            <h1>Versions</h1>
            <div className='flex col-span-7 w-full'>
                <h1 className='w-103.5'>Comment</h1>
                <h1 className='w-44'>Created</h1>
                <h1 className='w-44'>Updated</h1>
                <h1 className='w-20'>Revisions</h1>
            </div>
        </div>
    )
}
