import { Dispatch, SetStateAction } from 'react'
import Package from './package'

type PackagesProps = {
    groupedPackages: Record<string, Package[]>
    list: 'allow' | 'block'
    setPackages: Dispatch<SetStateAction<Package[]>>
    packages: Package[]
    author: Author
    repositories: Repository[]
    url: string | undefined
}

/**
 * Renders the packages by group in the user interface.
 * 
 * @param groupedPackages Packages sorted by group
 * @param list Whether this is the `allow` or `block` list
 * @param setPackages Helper function to set the packages to display
 * @param packages Packages to display
 * @param author User which created the package
 * @param repositories Repositories available (for autofill when creating new packages)
 * @param url IMAGE_URL to display the author avatar on the edit page
 * 
 * @returns React component
 */
export default function Packages({ 
    groupedPackages,
    list,
    setPackages,
    packages,
    author,
    repositories,
    url
}: PackagesProps) {
    return Object.keys(groupedPackages)
        .sort()
        .map((ecosystem) => (
            <div key={ecosystem} className='w-full'>
                <h2 className='text-xl font-bold text-blue-500'>{ecosystem}</h2>
                <ul
                    className='grid gap-4 w-full'
                >
                    {groupedPackages[ecosystem].map((pkg) => (
                        <Package
                            key={pkg.name}
                            pkg={pkg}
                            list={list}
                            setPackages={setPackages}
                            packages={packages}
                            author={author}
                            repositories={repositories}
                            url={url}
                        />
                    ))}
                </ul>
            </div>
        ))
}
