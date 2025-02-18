import { API } from "@constants"

type PutListProps = {
    list: 'whitelist' | 'blacklist'
    pkg: APIPackage
}

export default async function putPackage({list, pkg}: PutListProps) {
    try {
        const response = await fetch(`${API}/${list}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({...pkg})
        })

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
