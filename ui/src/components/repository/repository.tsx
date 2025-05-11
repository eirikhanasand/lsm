import Link from 'next/link'

/**
 * Displays a repository in the repositories list in the user interface.
 * 
 * @param repository Repository to display
 * @param index Index of the item in the parent list (for altering color)
 * 
 * @returns React component
 */
export default function Repository({ repository, index }: RepositoryProps) {
    const color = index % 2 !== 0 ? 'bg-normal' : ''
    return (
        <div className={`w-full grid grid-cols-8 ${color} p-4 text-foreground`}>
            <Link
                href={`/dashboard/repositories/config/${repository.key}`}
                className='text-blue-500 underline'>{repository.key}
            </Link>
            <h1>{repository.type}</h1>
            <h1 className='col-span-2'>{repository.url}</h1>
            <h1>{repository.packageType}</h1>
            <h1 className='col-span-3'>{repository.description}</h1>
        </div>
    )
}
