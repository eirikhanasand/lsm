import { SetStateAction } from "react"
import deletePackage from "./deletePackage"

type RemovePackageProps = {
    id: number
    newPackage: Package
    setPackages: (value: SetStateAction<Package[]>) => void
    packages: Package[]
    list: 'whitelist' | 'blacklist'
}

export default async function removePackage({id, newPackage, setPackages, packages, list}: RemovePackageProps) {
    const response = await deletePackage({list, name: newPackage.name, version: newPackage.version})

    if (response === 500) {
        alert("Failed to add package. API error.")
        return
    }

    setPackages(packages.filter((pkg) => pkg.id !== id))
}
