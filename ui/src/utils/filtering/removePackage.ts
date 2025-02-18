import { SetStateAction } from "react"
import deletePackage from "./deletePackage"

type RemovePackageProps = {
    name: string
    setPackages: (value: SetStateAction<APIPackage[]>) => void
    packages: APIPackage[]
    list: 'whitelist' | 'blacklist'
}

export default async function removePackage({name, setPackages, packages, list}: RemovePackageProps) {
    const response = await deletePackage({list, name})

    if (response === 500) {
        alert("Failed to add package. API error.")
        return
    }

    setPackages(packages.filter((pkg) => pkg.name !== name))
}
