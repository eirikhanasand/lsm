import { Dispatch, SetStateAction, useEffect, useState } from 'react'
import Edit from '../edit'
import Pencil from '../svg/pencil'
import Link from 'next/link'
import removePackage from '@/utils/filtering/removePackage'
import Trash from '../svg/trash'
import { useRouter } from 'next/navigation'
import { getCookie } from '@/utils/cookies'

type PackageProps = {
    pkg: Package
    list: 'white' | 'black'
    setPackages: Dispatch<SetStateAction<Package[]>>
    packages: Package[]
    author: Author
    repositories: Repository[]
}

export default function Package({ pkg, setPackages, packages, list, author, repositories }: PackageProps) {
    const [editing, setEditing] = useState(false)
    const [createdDate, setCreatedDate] = useState('')
    const [updatedDate, setUpdatedDate] = useState('')
    const router = useRouter()

    function handleDelete() {
        const token = getCookie('token')
        if (!token && process.env.NEXT_PUBLIC_DISABLE_TOKEN_CHECK !== 'true') {
            alert('Missing token, redirecting to login.')
            return router.push('/logout')
        }

        removePackage({
            name: pkg.name,
            packages,
            setPackages,
            list,
            token: token || ''
        })
    }

    useEffect(() => {
        setCreatedDate(new Date(pkg.created.time).toLocaleString())
        setUpdatedDate(new Date(pkg.updated.time).toLocaleString())
    }, [pkg])

    return (
        <li className='relative grid grid-cols-12 bg-background p-4 rounded-md shadow-sm border border-blue-500 min-w-100'>
            {editing && <Edit
                pkg={pkg}
                setEditing={setEditing}
                list={list}
                packages={packages}
                setPackages={setPackages}
                repositories={repositories}
                author={author}
            />}
            <div className='flex col-span-4'>
                <h1 className='text-sm text-foreground font-semibold text-wrap break-all w-full'>
                    {pkg.name}
                </h1>
                <div className='text-sm text-foreground w-full'>
                    {
                        Array.isArray(pkg.ecosystems) && pkg.ecosystems.length
                            ? pkg.ecosystems.map((ecosystem) => <h1 key={ecosystem}>{ecosystem}</h1>)
                            : 'All ecosystems'
                    }
                </div>
                <div className='text-sm text-foreground w-full'>
                    {
                        Array.isArray(pkg.repositories) && pkg.repositories.length
                            ? pkg.repositories.map((repository) => <h1 key={repository}>{repository}</h1>)
                            : 'Global'
                    }
                </div>
            </div>
            <h1 className='text-sm text-foreground'>
                {Array.isArray(pkg.versions) && pkg.versions.length ? pkg.versions.join(', ') : 'All versions'}
            </h1>
            <div className='flex col-span-7 gap-4'>
                <h1 className='text-sm text-shallow italic col-span-4 pr-2 w-100'>
                    {pkg.comment || ''}
                </h1>
                <h1 className='text-sm text-shallow w-40'>
                    {createdDate}
                </h1>
                <h1 className='text-sm text-shallow w-40'>
                    {updatedDate}
                </h1>
                <h1 className='text-sm text-shallow w-20'>
                    {pkg.changeLog.length}
                </h1>
            </div>
            <div className='absolute right-4 mt-3.5 flex'>
                <div className='mr-[2px]'>
                    {pkg.references && pkg.references.length > 1
                        ? <div className='relative group inline-block'>
                            <Link href={pkg.references[0]} className='info-icon border border-shallow px-[6.6px] rounded-full mb-5 text-shallow'>i</Link>

                            <div className='grid absolute right-0 hidden w-100 bg-light p-2 border border-blue-500 rounded group-hover:grid group-hover:grid-cols-1'>
                                {pkg.references.map((reference) => <Link
                                    key={reference}
                                    href={reference}
                                    className='text-blue-300 pl-1'
                                >
                                    {reference}
                                </Link>)}
                            </div>
                        </div>
                        : pkg.references.length === 1
                            ? <Link
                                href={pkg.references[0]}
                                className='info-icon border border-shallow px-[6.6px] rounded-full mb-5 text-shallow cursor-pointer hover:border-blue-500 hover:text-foreground'
                            >
                                i
                            </Link>
                            : <></>
                    }
                </div>
                <button onClick={() => setEditing(true)} className='h-[20px] w-[20px] self-end mb-[4px] pl-[2px]'>
                    <Pencil fill='pencil-icon cursor-pointer' className='pencil-icon max-w-[16px] max-h-[16px]' />
                </button>
                <button
                    onClick={handleDelete}
                    className='h-[20px] w-[20px] self-end mb-[4.2px]'
                >
                    <Trash
                        fill='fill-shallow hover:fill-red-500 cursor-pointer'
                        className='w-full h-full'
                    />
                </button>
            </div>
        </li>
    )
}