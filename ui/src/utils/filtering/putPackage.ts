type PutListProps = {
    list: 'allow' | 'block'
    pkg: PutPackage
    token: string
}

/**
 * Updates a package in the database `allow` or `block` list.
 * 
 * @param list List to update (`allow` / `block`)
 * @param pkg The updated package object
 * @param token User token 
 */
export default async function putPackage({ list, pkg, token }: PutListProps) {
    try {
        const headers = {
            ...( !process.env.NEXT_PUBLIC_DISABLE_AUTH && { 'Authorization': `Bearer ${token}` } ),
            'Content-Type': 'application/json'
        }
        const response = await fetch(`${process.env.NEXT_PUBLIC_API}/list/${list}`, {
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
