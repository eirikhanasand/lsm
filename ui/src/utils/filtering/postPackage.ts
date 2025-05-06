type PostListProps = {
    list: 'allow' | 'block'
    newPackage: AddPackage
    token: string
}

type PostPackageResponse = {
    status: 200 | 409 | 500
    data?: {
        message: string
    }
    error?: string
}

export default async function postPackage({ list, newPackage, token }: PostListProps): Promise<PostPackageResponse> {
    try {
        const headers = {
            ...( !process.env.NEXT_PUBLIC_DISABLE_AUTH && { 'Authorization': `Bearer ${token}` } ),
            'Content-Type': 'application/json'
        }
        
        const response = await fetch(`${process.env.NEXT_PUBLIC_API}/list/${list}`, {
            method: 'POST',
            headers,
            body: JSON.stringify({ ...newPackage })
        })

        if (response.status === 409) {
            return {
                status: 409,
                error: `Package ${newPackage.name} already exists in the ${list}list. Editing the existing one instead.`
            }
        }


        if (!response.ok) {
            throw new Error(await response.text())
        }

        const data = await response.json()
        return {
            status: 200,
            data
        }
    } catch (error) {
        console.error(error)
        return {
            status: 500,
            error: error as string
        }
    }
}
