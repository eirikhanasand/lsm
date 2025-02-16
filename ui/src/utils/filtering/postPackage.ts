import { API } from "@constants"

type PostListProps = {
    list: 'whitelist' | 'blacklist'
    ecosystem: string
    version: string
    name: string
    comment: string
    repository: string | null
}

export default async function postPackage({list, ecosystem, name, version}: PostListProps) {
    try {
        const response = await fetch(`${API}/${list}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ecosystem, version, name})
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
