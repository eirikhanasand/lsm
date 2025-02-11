import { API } from "../../../constants"

type DeleteListProps = {
    list: 'whitelist' | 'blacklist'
}

export default async function deletePackage({list}: DeleteListProps) {
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
