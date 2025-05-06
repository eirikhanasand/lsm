import config from '@constants'

const { SERVER_API, DEFAULT_RESULTS_PER_PAGE } = config

type GetListProps = {
    list: 'allow' | 'block'
    side: 'server' | 'client'
    page?: string
    resultsPerPage?: string
    search?: string
}

type Packages = {
    page: number
    pages: number
    resultsPerPage: number
    result: Package[]
    error?: 500
}

// Fetches all packages from lsm API
export default async function getPackages({ 
    list, 
    side,
    search,
    page,
    resultsPerPage
}: GetListProps): Promise<Packages> {
    try {
        const params = new URLSearchParams({ 
            page: page || '1', 
            resultsPerPage: resultsPerPage || String(DEFAULT_RESULTS_PER_PAGE || 50),
            search: search || ''
        })

        const response = await fetch(`${side === 'server' ? SERVER_API : process.env.NEXT_PUBLIC_API}/list/${list}?${params}`)
        if (!response.ok) {
            throw new Error(await response.text())
        }

        const data = await response.json()
        return data
    } catch (error) {
        console.error(error)
        return {
            page: 1,
            pages: 1,
            resultsPerPage: Number(DEFAULT_RESULTS_PER_PAGE) || 50,
            result: [],
            error: 500
        }
    }
}

// Fetches a specific package from lsm API
export async function getPackage({ list }: GetListProps) {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API}/${list}`)

        if (!response.ok) {
            throw new Error(await response.text())
        }

        const data = await response.json()
        return data
    } catch (error) {
        console.error(error)
        return 500
    }
}
