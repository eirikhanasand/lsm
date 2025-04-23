import { SetStateAction } from "react"
import putPackage from "./putPackage"
import { getCookie } from "../cookies"
import { useRouter } from "next/navigation"

type RemovePackageProps = {
    pkg: Package
    setPackages: (value: SetStateAction<Package[]>) => void
    packages: Package[]
    list: 'white' | 'black'
    author: Author
}

export default async function editPackage({
    pkg,
    setPackages,
    packages,
    list,
    author,
}: RemovePackageProps) {
    const router = useRouter()
    const token = getCookie('token')
    if (!token) {
        alert("Missing token, redirecting to login.")
        return router.push('/logout')
    }

    const response = await putPackage({
        list, 
        pkg: {
            name: pkg.name,
            ecosystems: pkg.ecosystems,
            versions: pkg.versions,
            comment: pkg.comment,
            references: pkg.references,
            repositories: pkg.repositories,
            author
        },
        token
    })

    if (response === 500) {
        alert("Failed to edit package. API error.")
        return
    }

    setPackages(packages.map((p) => p.name === pkg.name ? pkg : p))
}
