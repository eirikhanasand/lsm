import { SetStateAction } from "react"
import deletePackage from "./deletePackage"

type RemovePackageProps = {
    id: number
    setPackages: (value: SetStateAction<Package[]>) => void
    packages: Package[]
}

export default async function removePackage({id, setPackages, packages}: RemovePackageProps) {
    const response = await deletePackage({list: 'whitelist'})

    if (response === 500) {
        alert("Failed to add package. API error.")
        return
    }

    setPackages(packages.filter((pkg) => pkg.id !== id))
}
