import { API, DISABLE_AUTH } from "@constants"

type PostListProps = {
    list: 'white' | 'black'
    newPackage: AddPackage
    token: string
}

export default async function postPackage({ list, newPackage, token }: PostListProps) {
    try {
        const headers = {
            ...( !DISABLE_AUTH && { 'Authorization': `Bearer ${token}` } ),
            'Content-Type': 'application/json'
        }
        const response = await fetch(`${API}/list/${list}`, {
            method: 'POST',
            headers,
            body: JSON.stringify({ ...newPackage })
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
