type DeleteListProps = {
    list: 'allow' | 'block'
    name: string
    token: string
}

/**
 * Deletes a package from the database.
 * 
 * @param list Whether the package should be deleted from the `allow` or `block` list.
 * @param name The name of the package to delete.
 * @param token Token used to authenticate the request.
 * 
 * @returns The response from the API, or a 500 error code if an error occured.
 */
export default async function deletePackage({ list, name, token }: DeleteListProps) {
    try {
        const headers = {
            ...( !process.env.NEXT_PUBLIC_DISABLE_AUTH && { 'Authorization': `Bearer ${token}` } )
        }

        const response = await fetch(`${process.env.NEXT_PUBLIC_API}/list/${list}/${name}`, { 
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
