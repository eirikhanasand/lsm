import { SetStateAction } from "react"
import putPackage from "./putPackage"

type RemovePackageProps = {
    pkg: APIPackage
    setPackages: (value: SetStateAction<APIPackage[]>) => void
    packages: APIPackage[]
    list: 'whitelist' | 'blacklist'
}

export default async function editPackage({pkg, setPackages, packages, list}: RemovePackageProps) {
    const response = await putPackage({list, pkg: {
        name: pkg.name,
        ecosystem: pkg.ecosystems.join(','),
        version: pkg.versions.join(','),
        comment: pkg.comments.join(','),
        repository: pkg.repositories.join(','),
        author: pkg.authors.join(','),
        createdAt: pkg.createdAt,
        createdBy: pkg.createdBy,
        updatedAt: pkg.updatedAt,
        updatedBy: pkg.updatedBy,
        changeLog: pkg.changeLog
    }})

    if (response === 500) {
        alert("Failed to edit package. API error.")
        return
    }

    setPackages(packages.map((p) =>p.name === pkg.name ? pkg : p));
}
