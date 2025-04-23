import { SetStateAction } from "react"
import deletePackage from "./deletePackage"
import { useRouter } from "next/navigation"
import { getCookie } from "../cookies"

type RemovePackageProps = {
    name: string
    setPackages: (value: SetStateAction<Package[]>) => void
    packages: Package[]
    list: 'white' | 'black'
}

export default async function removePackage({
    name,
    setPackages,
    packages,
    list
}: RemovePackageProps) {
    const router = useRouter()
    const token = getCookie('token')
    if (!token) {
        alert("Missing token, redirecting to login.")
        return router.push('/logout')
    }

    const response = await deletePackage({ list, name, token })

    if (response === 500) {
        alert("Failed to delete package. API error.")
        return
    }

    setPackages(packages.filter((pkg) => pkg.name !== name))
}
