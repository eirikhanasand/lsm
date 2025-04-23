import config from '@constants'

const { SERVER_API } = config

type GetListProps = {
    list: 'white' | 'black'
    side: 'server' | 'client'
}

// Fetches all packages from lsm API
export default async function getPackages({ list, side }: GetListProps): Promise<Package[] | number> {
    try {
        const response = await fetch(`${side === 'server' ? SERVER_API : process.env.NEXT_PUBLIC_API}/list/${list}`)

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
