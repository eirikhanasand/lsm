import { API, SERVER_API } from "@constants"

type GetListProps = {
    list: 'whitelist' | 'blacklist'
    side: 'server' | 'client'
}

// Fetches all packages from lsm API
export default async function getPackages({list, side}: GetListProps) {
    try {
        const response = await fetch(`${side === 'server' ? SERVER_API : API}/${list}`)

        if (!response.ok) {
            throw new Error(await response.text())
        }

        const data = await response.json()
        console.log("returning", data)
        return data
    } catch (error) {
        console.error(error)
        return 500
    }
}

// Fetches a specific package from lsm API
export async function getPackage({list}: GetListProps) {
    try {
        const response = await fetch(`${API}/${list}`)

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
