import { SetStateAction } from "react"
import putPackage from "./putPackage"

type RemovePackageProps = {
    pkg: Package
    setPackages: (value: SetStateAction<Package[]>) => void
    packages: Package[]
    list: 'whitelist' | 'blacklist'
    author: Author
}

export default async function editPackage({pkg, setPackages, packages, list, author}: RemovePackageProps) {
    const response = await putPackage({list, pkg: {
        name: pkg.name,
        ecosystem: pkg.ecosystems.join(','),
        version: pkg.versions.join(','),
        comment: pkg.comments.join(','),
        repository: pkg.repositories.join(','),
        author
    }})

    if (response === 500) {
        alert("Failed to edit package. API error.")
        return
    }

    setPackages(packages.map((p) =>p.name === pkg.name ? pkg : p));
}
