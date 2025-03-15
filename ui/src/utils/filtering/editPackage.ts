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
        ecosystems: pkg.ecosystems,
        versions: pkg.versions,
        comment: pkg.comment,
        references: pkg.references,
        repositories: pkg.repositories,
        author
    }})

    if (response === 500) {
        alert("Failed to edit package. API error.")
        return
    }

    setPackages(packages.map((p) =>p.name === pkg.name ? pkg : p))
}
