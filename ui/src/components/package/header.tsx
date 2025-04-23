import { setCookie } from '@/utils/cookies'
import { Dispatch, SetStateAction, useEffect, useState } from 'react'
import Paging from '../global/paging'
import { useSearchParams } from 'next/navigation'
import config from '@parent/constants'

const { DEFAULT_RESULTS_PER_PAGE } = config

type HeaderProps = {
    list: 'white' | 'black'
    selectedEcosystem: string
    setSelectedEcosystem: Dispatch<SetStateAction<string>>
    groupedPackages: Record<string, Package[]>
    selectedVersion: string
    setSelectedVersion: Dispatch<SetStateAction<string>>
    allVersions: string[]
    showGlobalOnly: boolean
    setShowGlobalOnly: Dispatch<SetStateAction<boolean>>
    searchTerm: string
    setSearchTerm: Dispatch<SetStateAction<string>>
    showForm: boolean
    setShowForm: Dispatch<SetStateAction<boolean>>
}

export default function Header({
    list,
    selectedEcosystem,
    setSelectedEcosystem,
    groupedPackages,
    selectedVersion,
    setSelectedVersion,
    allVersions,
    showGlobalOnly,
    setShowGlobalOnly,
    searchTerm,
    setSearchTerm,
    showForm,
    setShowForm
}: HeaderProps) {
    const searchParams = useSearchParams()
    const initialPage = Number(searchParams.get('page')) || 1
    const [page, setPage] = useState(initialPage)
    const [resultsPerPage, setResultsPerPage] = useState(Number(DEFAULT_RESULTS_PER_PAGE))
    const items = Object.values(groupedPackages).flat()

    useEffect(() => {
        setCookie('showGlobalOnly', String(showGlobalOnly))
    }, [showGlobalOnly])

    return (
        <>
            <div className='flex px-6 pt-6 gap-2'>
                <div className='w-1/2'>
                    <h1 className='text-3xl font-bold text-blue-600'>{`${list === 'white' ? 'Whitelisted' : 'Blacklisted'} Packages`}</h1>
                    <p className='text-foreground'>
                        Manage the list of{' '}
                        {list === 'white' ? 'safe' : 'dangerous'} packages.
                    </p>
                </div>

                <div className='w-full h-[2rem] flex justify-end gap-2'>
                    <select
                        value={selectedEcosystem}
                        onChange={(e) => setSelectedEcosystem(e.target.value)}
                        className='h-full select-repo p-1 border border-dark rounded text-sm text-foreground focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
                    >
                        <option value=''>All Ecosystems</option>
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
                        className='h-full select-version p-1 border border-dark rounded text-sm text-foreground focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
                    >
                        <option value=''>All Versions</option>
                        {allVersions.map((version) => (
                            <option key={version} value={version}>
                                {version}
                            </option>
                        ))}
                    </select>
                    <div className='h-full grid place-items-center'>
                        <label className='h-full relative inline-flex items-center cursor-pointer'>
                            <input
                                type='checkbox'
                                className='sr-only peer'
                                checked={showGlobalOnly}
                                onChange={(e) => setShowGlobalOnly(e.target.checked)}
                            />
                            <div className='absolute inset-0 bg-light hover:bg-extralight rounded-lg' />

                            <div className={`
                                absolute top-0 left-0 h-full w-1/2 rounded-lg
                                bg-blue-500
                                transform transition-transform duration-300 ease-in-out
                                ${showGlobalOnly ? 'translate-x-full' : 'translate-x-0'}
                            `} />
                            <div className='relative grid grid-cols-2 place-items-center px-2 text-foreground text-sm font-medium gap-4'>
                                <div className='text-center'>Local</div>
                                <div className='text-center'>Global</div>
                            </div>
                        </label>
                    </div>
                    <input
                        type='text'
                        placeholder='Search for a package...'
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className='h-full px-2 py-4 bg-light hover:bg-extralight rounded self-center'
                    />
                </div>
                <Paging
                    page={page}
                    setPage={setPage}
                    resultsPerPage={resultsPerPage}
                    items={items}
                    setResultsPerPage={setResultsPerPage}
                    searchParams={searchParams}
                />
            </div>
            <div className='fixed w-full h-full grid place-items-end top-0 pointer-events-none z-100'>
                <button
                    onClick={() => {
                        if (!showForm) {
                            setShowForm(true)
                        }
                    }}
                    disabled={showForm}
                    className='w-40 h-10 rounded-lg relative bg-blue-500 px-6 py-2 text-white hover:bg-blue-600 right-6 bottom-6 pointer-events-auto z-1000'
                >
                    + Add Package
                </button>
            </div>
        </>
    )
}
