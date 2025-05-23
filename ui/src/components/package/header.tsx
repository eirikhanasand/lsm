import { setCookie } from '@/utils/cookies'
import { Dispatch, SetStateAction, useEffect, useState } from 'react'
import Paging from '../global/paging'
import { useSearchParams } from 'next/navigation'
import config from '@parent/constants'
import getPackages from '@/utils/filtering/getPackage'

const { DEFAULT_RESULTS_PER_PAGE } = config

type HeaderProps = {
    list: 'allow' | 'block'
    selectedEcosystem: string
    setSelectedEcosystem: Dispatch<SetStateAction<string>>
    groupedPackages: Record<string, Package[]>
    selectedVersion: string
    setSelectedVersion: Dispatch<SetStateAction<string>>
    allVersions: string[]
    showGlobalOnly: boolean
    setShowGlobalOnly: Dispatch<SetStateAction<boolean>>
    search: string
    setSearch: Dispatch<SetStateAction<string>>
    showForm: boolean
    setShowForm: Dispatch<SetStateAction<boolean>>
    setItems: Dispatch<SetStateAction<Package[]>>
    pages: number
}

/**
 * Displays the header for the `allow` and `block` list.
 * @param list Whether this is the `allow` or `block` list
 * @param selectedEcosystem Ecosystem filter
 * @param setSelectedEcosystem Helper function to set the ecosystem filter
 * @param groupedPackages Packages grouped by ecosystem
 * @param selectedVersion Version filter
 * @param setSelectedVersion Helper function to set the selected version to filter by
 * @param allVersions All versions available in the current results to be used 
 * for filtering
 * @param showGlobalOnly Boolean determining whether only global packages should 
 * be displayed
 * @param setShowGlobalOnly Helper function to determine whether only global 
 * packages should be displayed
 * @param search Search query
 * @param setSearch Helper function to update the search query
 * @param showForm Boolean determining whether the add package dialogue should 
 * be open
 * @param setShowForm Helper function to set whether the add package dialogue 
 * should be open
 * @param setItems Helper function to set the items to display
 * @param pages The amount of pages of results that exist
 * @returns React component
 */
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
    search,
    setSearch,
    showForm,
    setShowForm,
    setItems,
    pages: serverPages
}: HeaderProps) {
    const searchParams = useSearchParams()
    const initialPage = Number(searchParams.get('page')) || 1
    const [page, setPage] = useState(initialPage)
    const [pages, setPages] = useState(serverPages)
    const [resultsPerPage, setResultsPerPage] = useState(Number(DEFAULT_RESULTS_PER_PAGE || 50))

    useEffect(() => {
        setCookie('showGlobalOnly', String(showGlobalOnly))
    }, [showGlobalOnly])

    async function fetchFunction() {
        const packages = await getPackages({ 
            list, 
            side: 'client', 
            page: page ? String(page) : undefined, 
            resultsPerPage: resultsPerPage ? String(resultsPerPage) : String(DEFAULT_RESULTS_PER_PAGE || 50),
            search
        })
        
        if (packages) {
            setItems(packages.result)
            setPages(packages.pages)
        }
    }

    return (
        <>
            <div className='flex px-6 pt-6 gap-2'>
                <div className='w-1/2'>
                    <h1 className='text-3xl font-bold text-blue-600'>{`${list[0].toUpperCase()}${list.slice(1)}ed Packages`}</h1>
                    <p className='text-foreground'>
                        Manage the list of {list}ed packages.
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
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className='h-full px-2 py-4 bg-light hover:bg-extralight rounded self-center'
                    />
                </div>
                <Paging
                    page={page}
                    pages={pages}
                    setPage={setPage}
                    search={search}
                    fetchFunction={fetchFunction}
                    resultsPerPage={resultsPerPage}
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
