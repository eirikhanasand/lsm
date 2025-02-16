import { SetStateAction } from "react"
import deletePackage from "./deletePackage"

type RemovePackageProps = {
    newPackage: Package
    setPackages: (value: SetStateAction<Package[]>) => void
    packages: Package[]
    list: 'whitelist' | 'blacklist'
}

export default async function removePackage({newPackage, setPackages, packages, list}: RemovePackageProps) {
    const response = await deletePackage({list, name: newPackage.name, version: newPackage.version})

    if (response === 500) {
        alert("Failed to add package. API error.")
        return
    }

    setPackages(packages.filter((pkg) => pkg.name !== newPackage.name))
}
