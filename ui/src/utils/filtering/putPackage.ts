import { API } from "@constants"

type PutListProps = {
    list: 'whitelist' | 'blacklist'
    name: string
    oldVersion: string
    newVersion: string
    ecosystem: string
}

export default async function putPackage({list, name, oldVersion, newVersion, ecosystem}: PutListProps) {
    try {
        const response = await fetch(`${API}/${list}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ecosystem, oldVersion, newVersion, name})
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
