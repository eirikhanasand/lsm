import { SetStateAction } from 'react'
import deletePackage from './deletePackage'

type RemovePackageProps = {
    name: string
    setPackages: (value: SetStateAction<Package[]>) => void
    packages: Package[]
    list: 'white' | 'black'
    token: string
}

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
