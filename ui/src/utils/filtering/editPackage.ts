import { SetStateAction } from "react"
import putPackage from "./putPackage"

type RemovePackageProps = {
    pkg: APIPackage
    setPackages: (value: SetStateAction<APIPackage[]>) => void
    packages: APIPackage[]
    list: 'whitelist' | 'blacklist'
}

export default async function editPackage({pkg, setPackages, packages, list}: RemovePackageProps) {
    const response = await putPackage({list, pkg})

    if (response === 500) {
        alert("Failed to edit package. API error.")
        return
    }

    setPackages(packages.filter((p) => p.name !== pkg.name))
}
