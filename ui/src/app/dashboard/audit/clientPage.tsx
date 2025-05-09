'use client'

import Paging from '@/components/global/paging'
import ProfileIcon from '@/components/svg/profileIcon'
import getAuditLog from '@/utils/filtering/getAuditLog'
import config from '@parent/constants'
import Image from 'next/image'
import { useSearchParams } from 'next/navigation'
import { useState } from 'react'

const { DEFAULT_RESULTS_PER_PAGE } = config

type PageProps = {
    logs: AuditResult[]
    pages: number
    url: string | undefined
}

type LogProps = {
    log: AuditResult
    url: string | undefined
}

export default function Page({ logs, pages: serverPages, url }: PageProps) {
    const searchParams = useSearchParams()
    const initialSearch = searchParams.get('search') || ''
    const initialPage = Number(searchParams.get('page')) || 1
    const [page, setPage] = useState(initialPage)
    const [pages, setPages] = useState(serverPages)
    const [search, setSearch] = useState(initialSearch)
    const [items, setItems] = useState(logs)
    const [resultsPerPage, setResultsPerPage] = useState(Number(DEFAULT_RESULTS_PER_PAGE) || 50)

    async function fetchFunction() {
        const auditLog: AuditProps = await getAuditLog({
            side: 'client',
            search,
            page: String(page),
            resultsPerPage: String(resultsPerPage)
        })

        if ('results' in auditLog) {
            setItems(auditLog.results)
            setPages(auditLog.pages)
        }
    }

    return (
        <main className='min-h-full max-h-full overflow-hidden w-full flex flex-col p-4 gap-2'>
            <div className='flex justify-between w-full'>
                <div>
                    <h1 className='text-3xl font-bold text-blue-600'>Audit Log</h1>
                    <p className='text-foreground py-2'>{logs.length ? 'Recent changes.' : 'No recent changes.'}</p>
                </div>
                <div className='flex gap-2'>
                    <input
                        type='text'
                        placeholder='Search for a change...'
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
            <div className='h-full w-full overflow-auto grid gap-2'>
                {items.map((log: AuditResult) =>
                    <Log key={log.id} log={log} url={url} />
                )}
            </div>
        </main>
    )
}

function Log({ log, url }: LogProps) {
    const date = new Date(log.timestamp).toLocaleString('en-GB').replaceAll('/', '.')
    const imageExists = url && log.author.avatar !== 'null'
    return (
        <div className='flex w-full bg-dark rounded-lg px-4 min-h-[40px]'>
            <div className='flex gap-2 w-[15vw]'>
                <div className='relative w-[3.5vh] h-[3.5vh] self-center cursor-pointer rounded-full overflow-hidden'>
                    {imageExists ? <Image
                        src={`${url}/${log.author.id}/${log.author.avatar}.png?size=64`}
                        alt='Profile Icon'
                        fill={true}
                    /> : <ProfileIcon />}
                </div>
                <h1 className='grid place-items-center text-white'>{log.author.name}</h1>
            </div>
            <h1 className='flex-1 flex items-center text-white'>{log.event}</h1>
            <div className='grid place-items-end'>
                <h1 className='relative mb-auto text-shallow-light text-sm'>{date}</h1>
                <h1 className='relative mt-auto text-shallow-dark text-sm'>{log.id}</h1>
            </div>
        </div>
    )
}
