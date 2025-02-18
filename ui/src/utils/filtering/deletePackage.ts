import { API } from "@constants"

type DeleteListProps = {
    list: 'whitelist' | 'blacklist'
    name: string
}

export default async function deletePackage({list, name}: DeleteListProps) {
    try {
        const response = await fetch(`${API}/${list}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({name})
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
