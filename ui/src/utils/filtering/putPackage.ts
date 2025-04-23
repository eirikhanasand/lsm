import { API, DISABLE_AUTH } from "@constants"

type PutListProps = {
    list: 'white' | 'black'
    pkg: PutPackage
    token: string
}

export default async function putPackage({ list, pkg, token }: PutListProps) {
    try {
        const headers = {
            ...( !DISABLE_AUTH && { 'Authorization': `Bearer ${token}` } ),
            'Content-Type': 'application/json'
        }
        const response = await fetch(`${API}/list/${list}`, {
            method: 'PUT',
            headers,
            body: JSON.stringify({ ...pkg })
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
