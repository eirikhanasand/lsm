type DeleteListProps = {
    list: 'allow' | 'block'
    name: string
    token: string
}

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
