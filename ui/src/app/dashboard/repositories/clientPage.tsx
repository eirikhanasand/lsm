'use client'

import Paging from '@/components/global/paging'
import Repository from '@/components/repository/repository'
import fetchRepositories from '@/utils/fetchRepositories'
import config from '@parent/constants'
import { useSearchParams } from 'next/navigation'
import { useState } from 'react'

const { DEFAULT_RESULTS_PER_PAGE } = config

type PageProps = {
    pages: number
    repositories: Repository[]
}

/**
 * Client repositories component. Displays the repositories from JFrog 
 * Artifactory in the user interface.
 * 
 * @param repositories Repositories to display
 * @param pages The number of pages of results
 * 
 * @returns React component 
 */
export default function Page({ repositories, pages: serverPages }: PageProps) {
    const searchParams = useSearchParams()
    const initialPage = Number(searchParams.get('page')) || 1
    const [page, setPage] = useState(initialPage)
    const [pages, setPages] = useState(serverPages)
    const [search, setSearch] = useState('')
    const [resultsPerPage, setResultsPerPage] = useState(Number(DEFAULT_RESULTS_PER_PAGE) || 50)
    const [items, setItems] = useState(repositories)

    async function fetchFunction() {
        const response = await fetchRepositories({
            search,
            page: String(page)
        })

        if ('result' in response) {
            setItems(response.result)
            setPages(response.pages)
        }
    }

    return (
        <main className='min-h-full max-h-full overflow-hidden w-full flex flex-col p-4 gap-2'>
            <div className='flex justify-between w-full'>
                <div>
                    <h1 className='text-3xl font-bold text-blue-600'>Repositories</h1>
                    <p className='mt-2 text-foreground mb-2'>List of repositories in Artifactory.</p>
                </div>
                <div className='flex gap-2'>
                    <input
                        type='text'
                        placeholder='Search for a repository...'
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className='max-h-fit p-1 px-2 bg-light hover:bg-extralight rounded'
                    />
                    <Paging
                        page={page}
                        pages={pages}
                        search={search}
                        setPage={setPage}
                        resultsPerPage={resultsPerPage}
                        fetchFunction={fetchFunction}
                        setResultsPerPage={setResultsPerPage}
                        searchParams={searchParams}
                    />
                </div>
            </div>
            <div className='grid grid-cols-8 bg-normal w-full max-h-[200px] items-center pl-4 text-foreground py-4 font-semibold'>
                <h1>Key</h1>
                <h1>Type</h1>
                <h1 className='col-span-2'>URL</h1>
                <h1>Package Type</h1>
                <h1 className='col-span-3'>Description</h1>
            </div>
            <div className='h-full w-full overflow-auto'>
                {items.map((repository, index) => <Repository
                    key={JSON.stringify(repository)}
                    repository={repository}
                    index={index}
                />)}
            </div>
        </main>
    )
}
