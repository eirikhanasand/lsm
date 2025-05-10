import { SetStateAction } from 'react'
import putPackage from './putPackage'

type RemovePackageProps = {
    pkg: Package
    setPackages: (value: SetStateAction<Package[]>) => void
    packages: Package[]
    list: 'allow' | 'block'
    author: Author
    token: string
}

/**
 * Helper function used when editing a package on the API.
 * 
 * @param pkg The package to edit
 * @param setPackages Helper function to update the packages rendered in the 
 * user interface to display the updated information till the page is refreshed. 
 * @param packages Packages currently displayed in the user interface
 * @param list List to edit (`allow` or `block`)
 * @param author User performing the change
 * @param token Token used to authenticate the request 
 */
export default async function editPackage({
    pkg,
    setPackages,
    packages,
    list,
    author,
    token
}: RemovePackageProps) {
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
        alert('Failed to edit package. API error.')
        return
    }

    // Updates the packages rendered to match the change
    setPackages(packages.map((p) => p.name === pkg.name ? pkg : p))
}
