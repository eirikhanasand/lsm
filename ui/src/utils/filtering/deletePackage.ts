import { API, DISABLE_AUTH } from "@constants"

type DeleteListProps = {
    list: 'white' | 'black'
    name: string
    token: string
}

export default async function deletePackage({ list, name, token }: DeleteListProps) {
    try {
        const headers = {
            ...( !DISABLE_AUTH && { 'Authorization': `Bearer ${token}` } ),
            'Content-Type': 'application/json'
        }
        const response = await fetch(`${API}/${list}/${name}`, { 
            method: 'DELETE', 
            headers 
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
