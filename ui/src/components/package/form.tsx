import { Dispatch, SetStateAction, useState } from 'react'
import Dropdown from '../global/dropdown'
import addPackage from '@/utils/filtering/addPackage'
import { useRouter } from 'next/navigation'
import { getCookie } from '@/utils/cookies'
import config from '@parent/constants'

const { ECOSYSTEMS } = config 

type FormProps = {
    showForm: boolean
    setShowForm: Dispatch<SetStateAction<boolean>>
    newPackage: AddPackage
    setNewPackage: Dispatch<SetStateAction<AddPackage>>
    setPackages: Dispatch<SetStateAction<Package[]>>
    list: 'allow' | 'block'
    author: Author
    formStyle: string
    repositories: Repository[]
    packages: Package[]
}

/**
 * Add package form
 * 
 * @param showForm Whether the form should be visible
 * @param newPackage Variable to manage the form package
 * @param setShowFrom Helper function to determine whether the form should be 
 * visible
 * @param setNewPackage Helper function to manage the form package
 * @param formStyle Tailwind styles for the form
 * @param repositories Repositories available (used to preview the available 
 * repository options)
 * @param setPackages Helper function to set the packages currently displayed in 
 * the user interface
 * @param packages Packages currently displayed in the user interface
 * @param list Whether this is the `allow` or `block` list
 * @param author Current user
 * 
 * @returns React component 
 */
export default function Form({
    showForm,
    newPackage,
    setShowForm,
    setNewPackage,
    formStyle,
    repositories,
    setPackages,
    packages,
    list,
    author
}: FormProps) {
    const router = useRouter()
    const [error, setError] = useState('')
    function handleAdd() {
        const token = getCookie('token')
        if (
            !token 
            && (process.env.NEXT_PUBLIC_DISABLE_TOKEN_CHECK !== 'true' 
            && process.env.NEXT_PUBLIC_DISABLE_AUTH !== 'true')
        ) {
            alert('Missing token, redirecting to login.')
            return router.push('/logout')
        }
        addPackage({
            newPackage,
            setPackages,
            setShowForm,
            setNewPackage,
            setError,
            packages,
            list,
            author,
            token: token || ''
        })
    }

    if (!showForm) {
        return <></>
    }

    return (
        <div
            className='w-full h-full absolute left-0 top-0 grid place-items-center bg-black/80 z-1000'
            onClick={() => setShowForm(false)}
        >
            <div
                className='grid w-[35vw] bg-normal rounded-lg p-8 overflow-auto noscroll'
                onClick={(e) => e.stopPropagation()}
            >
                <h2 className='text-lg font-semibold text-foreground'>
                    Add New Package
                </h2>
                {error.length > 0 && <h2 className='text-sm text-foreground bg-red-500/50 rounded-lg p-2'>
                    {error}
                </h2>}

                <input
                    type='text'
                    placeholder='Package Name'
                    value={newPackage.name}
                    onChange={(e) =>
                        setNewPackage({ ...newPackage, name: e.target.value })
                    }
                    className={`${formStyle} bg-light text-foreground`}
                />
                <input
                    type='text'
                    placeholder='Version'
                    value={newPackage.versions}
                    onChange={(e) =>
                        setNewPackage({ ...newPackage, versions: e.target.value.replaceAll(' ', '').split(',') })
                    }
                    className={`${formStyle} bg-light text-foreground`}
                />
                <Dropdown
                    className='mt-2'
                    item='ecosystems'
                    items={newPackage.ecosystems}
                    allItems={ECOSYSTEMS}
                    setItems={(items) => setNewPackage({ ...newPackage, ecosystems: items })}
                />
                <Dropdown
                    className='mt-2'
                    item='repositories'
                    items={newPackage.repositories}
                    allItems={repositories.map((repository) => `[${repository.type}] ${repository.key}`)}
                    setItems={(items) => setNewPackage({ ...newPackage, repositories: items })}
                />
                <input
                    type='text'
                    placeholder='Reference'
                    value={newPackage.references}
                    onChange={(e) =>
                        setNewPackage({ ...newPackage, references: e.target.value.replaceAll(' ', '').split(',') })
                    }
                    className={`${formStyle} bg-light text-foreground`}
                />
                <textarea
                    placeholder='Reason'
                    value={newPackage.comment}
                    onChange={(e) =>
                        setNewPackage({ ...newPackage, comment: e.target.value })
                    }
                    className={`${formStyle} bg-light text-foreground h-32`}
                />

                <div className='mt-4 flex justify-between'>
                    <button
                        onClick={() => setShowForm(false)}
                        className='bg-red-500 px-4 py-2 rounded-md text-white hover:bg-red-600'
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleAdd}
                        className='bg-green-500 px-4 py-2 rounded-md text-white hover:bg-green-600'
                    >
                        Add
                    </button>
                </div>
            </div>
        </div>
    )
}
