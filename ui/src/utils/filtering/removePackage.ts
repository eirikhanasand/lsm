import { SetStateAction } from 'react'
import deletePackage from './deletePackage'

type RemovePackageProps = {
    name: string
    setPackages: (value: SetStateAction<Package[]>) => void
    packages: Package[]
    list: 'allow' | 'block'
    token: string
}

/**
 * Removes a package from the database `allow` or `block` list.
 * 
 * @param name Name of the package to remove
 * @param setPackages React dispatch object to temporarily remove it from the 
 * user interface (the API update will not propagate till the page is refreshed) 
 * @param packages Packages currently displayed in the user interface
 * @param list `allow` or `block`, depending on which list to remove it from
 * @param token User token 
 */
export default async function removePackage({
    name,
    setPackages,
    packages,
    list,
    token
}: RemovePackageProps) {
    const response = await deletePackage({ list, name, token })

    if (response === 500) {
        alert('Failed to delete package. API error.')
        return
    }

    setPackages(packages.filter((pkg) => pkg.name !== name))
}
