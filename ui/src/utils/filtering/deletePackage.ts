import { API } from "@constants"

type DeleteListProps = {
    list: 'white' | 'black'
    name: string
}

export default async function deletePackage({list, name}: DeleteListProps) {
    try {
        const response = await fetch(`${API}/${list}/${name}`, {method: 'DELETE'})
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
