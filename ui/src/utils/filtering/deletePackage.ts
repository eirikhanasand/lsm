type DeleteListProps = {
    list: 'white' | 'black'
    name: string
    token: string
}

export default async function deletePackage({ list, name, token }: DeleteListProps) {
    try {
        const headers = {
            ...( !process.env.NEXT_PUBLIC_DISABLE_AUTH && { 'Authorization': `Bearer ${token}` } ),
            'Content-Type': 'application/json'
        }
        const response = await fetch(`${process.env.NEXT_PUBLIC_API}/${list}/${name}`, { 
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
