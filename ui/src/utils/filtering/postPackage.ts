import { API } from "@constants"

type PostListProps = {
    list: 'white' | 'black'
    newPackage: AddPackage
}

export default async function postPackage({ list, newPackage }: PostListProps) {
    try {
        const response = await fetch(`${API}/list/${list}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
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
