'use client'

import Paging from "@/components/paging"
import Repository from "@/components/repository"
import { DEFAULT_RESULTS_PER_PAGE } from "@parent/constants"
import { useSearchParams } from "next/navigation"
import { useState } from "react"

type PageProps = {
    repositories: Repository[]
    userAgent: string
}

export default function page({repositories, userAgent}: PageProps) {
    const searchParams = useSearchParams()
    const initialPage = Number(searchParams.get('page')) || 1
    const [page, setPage] = useState(initialPage)
    const [resultsPerPage, setResultsPerPage] = useState(Number(DEFAULT_RESULTS_PER_PAGE))
    const visible = repositories.slice(page > 1 ? (page - 1) * resultsPerPage : page - 1, page * resultsPerPage)

    return (
        <main className="min-h-full max-h-full overflow-hidden w-full flex flex-col p-4 gap-2">
            <Paging 
                page={page} 
                setPage={setPage} 
                userAgent={userAgent} 
                resultsPerPage={resultsPerPage} 
                items={repositories} 
                setResultsPerPage={setResultsPerPage}
                searchParams={searchParams}
            />
            <div className="grid grid-cols-8 bg-normal w-full max-h-[200px] items-center pl-4 text-foreground py-4 font-semibold">
                <h1>Key</h1>
                <h1>Type</h1>
                <h1 className="col-span-2">URL</h1>
                <h1>Package Type</h1>
                <h1 className="col-span-3">Description</h1>
            </div>
            <div className="h-full w-full overflow-auto">
                {visible.map((repository, index) => <Repository
                    key={JSON.stringify(repository)} 
                    repository={repository} 
                    index={index}
                />)}
            </div>
        </main>
    )
}
