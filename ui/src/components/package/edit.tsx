import { Dispatch, SetStateAction, useEffect, useRef, useState } from 'react'
import editPackage from '@/utils/filtering/editPackage'
import Image from 'next/image'
import Dropdown from '../global/dropdown'
import config from '@parent/constants'
import { getCookie } from '@/utils/cookies'
import { useRouter } from 'next/navigation'
import ProfileIcon from '../svg/profileIcon'

const { ECOSYSTEMS } = config

type EditProps = {
    pkg: Package
    setEditing: Dispatch<SetStateAction<boolean>>
    list: 'allow' | 'block'
    packages: Package[]
    setPackages: Dispatch<SetStateAction<Package[]>>
    author: Author
    repositories: Repository[]
    url: string | undefined
}

type ChangeProps = { 
    change: ChangeLog
    url: string | undefined
}

/**
 * Component to edit packages in the `allow` and `block` lists of the user 
 * interface.
 * 
 * @param pkg Package to edit
 * @param setEditing Boolean determining whether the Edit component should be 
 * visible
 * @param setPackages Helper function to set the currently displayed packages 
 * (updated on submit) 
 * @param packages Package scurrently displayed in the user interface 
 * @param list Whether the change concerns the `allow` or `block` list.
 * @param author Current user
 * @param repositories Repositories available. Used for the repository select menu
 * @param url IMAGE_URL to display the user avatar
 * 
 * @returns React component.
 */
export default function Edit({
    pkg,
    setEditing,
    setPackages,
    packages,
    list,
    author,
    repositories: serverRepositories,
    url
}: EditProps) {
    const [versions, setVersions] = useState(pkg.versions)
    const [ecosystems, setEcosystems] = useState(pkg.ecosystems)
    const [repositories, setRepositories] = useState(pkg.repositories)
    const [references, setReferences] = useState(pkg.references)
    const [comment, setComment] = useState(pkg.comment)
    const textareaRef = useRef<HTMLTextAreaElement>(null)
    const router = useRouter()

    function isEdited() {
        return !(JSON.stringify(versions) === JSON.stringify(pkg.versions)
            && JSON.stringify(ecosystems) === JSON.stringify(pkg.ecosystems)
            && JSON.stringify(repositories) === JSON.stringify(pkg.repositories)
            && JSON.stringify(references) === JSON.stringify(pkg.references)
            && JSON.stringify(comment) === JSON.stringify(pkg.comment))
    }

    function handleSave() {
        if (isEdited()) {
            const token = getCookie('token')
            if (
                !token 
                && (process.env.NEXT_PUBLIC_DISABLE_TOKEN_CHECK !== 'true' 
                && process.env.NEXT_PUBLIC_DISABLE_AUTH !== 'true')
            ) {
                alert('Missing token, redirecting to login.')
                return router.push('/logout')
            }
            editPackage({
                pkg: {
                    name: pkg.name,
                    versions,
                    ecosystems,
                    repositories,
                    comment,
                    references,
                    authors: pkg.authors,
                    created: pkg.created,
                    updated: pkg.updated,
                    changeLog: pkg.changeLog
                },
                setPackages,
                packages,
                list,
                author,
                token: token || ''
            })
        }
    }

    function autoResize(textarea: HTMLTextAreaElement) {
        textarea.style.height = 'auto'
        textarea.style.height = `${textarea.scrollHeight}px`
    }

    useEffect(() => {
        if (textareaRef.current) {
            autoResize(textareaRef.current)
        }
    }, [])

    return (
        <div
            className='w-[100vw] h-[100vh] fixed left-0 top-0 grid place-items-center bg-black/80 grid-cols-10 gap-4 p-6 z-100'
            onClick={() => setEditing(false)}
        >
            <div
                className='relative w-full h-full bg-normal rounded-xl p-4 col-span-4'
                onClick={(event) => event.stopPropagation()}
            >
                <h1 className='text-md font-semibold flex-grow'>
                    Editing package &quot;{pkg.name}&quot;
                </h1>

                <div className='flex pt-3'>
                    <div className='w-[140px] max-w-[140px] space-y-2'>
                        <h1 className='text-sm pt-2 p-1 w-full h-[4vh]'>Versions</h1>
                        <h1 className='text-sm pt-2 p-1 w-full h-[4vh]'>Ecosystems</h1>
                        <h1 className='text-sm pt-2 p-1 w-full h-[4vh]'>Repositories</h1>
                        <h1 className='text-sm pt-2 p-1 w-full h-[4vh]'>References</h1>
                        <h1 className='text-sm pt-2 p-1 w-full h-[4vh]'>Comment</h1>
                    </div>
                    <div className='w-full space-y-2'>
                        <input
                            className='text-sm bg-light p-1 pl-2 w-full rounded-lg h-[4vh] outline-none caret-blue-500'
                            value={versions.join(', ')}
                            type='text'
                            placeholder={`Versions to ${list}`}
                            onChange={(event) => setVersions(event.target.value.split(', '))}
                        />
                        <Dropdown
                            item='ecosystems'
                            items={ecosystems}
                            allItems={ECOSYSTEMS}
                            setItems={setEcosystems}
                        />
                        <Dropdown
                            item='repositories'
                            items={repositories}
                            allItems={serverRepositories.map((repository) => `[${repository.type}] ${repository.key}`)}
                            setItems={setRepositories}
                        />
                        <input
                            className='text-sm bg-light p-1 pl-2 w-full rounded-lg min-h-[4vh] outline-none caret-blue-500'
                            value={references.join(', ')}
                            type='text'
                            placeholder='References'
                            onChange={(event) => setReferences(event.target.value.split(', '))}
                        />
                        <textarea
                            className='text-sm bg-light p-1 pl-2 w-full h-auto rounded-lg min-h-[4vh] max-h-[60vh] outline-none caret-blue-500'
                            ref={textareaRef}
                            value={comment}
                            placeholder='Comment'
                            onChange={(event) => {
                                setComment(event.target.value);
                                autoResize(event.target)
                            }}
                        />
                    </div>
                </div>
            </div>
            <div className='w-full h-full bg-normal rounded-xl p-4 col-span-4'>
                <h1 className='text-md font-semibold w-full h-[4vh]'>Changelog</h1>
                <div className='text-xs text-shallow-dark w-full min-h-[4vh] max-h-[80vh] outline-none space-y-2 overflow-auto'>
                    {pkg.changeLog
                        .sort((a, b) => Number(b.id) - Number(a.id))
                        .map((change) => <Change 
                            key={change.id}
                            change={change} 
                            url={url}
                        />)
                    }
                </div>
                <div className='grid gap-[2px]'>
                    <h1 className='text-xs text-shallow-dark p-1 pl-2 w-full rounded-lg h-[2vh] outline-none'>
                        Updated {new Date(pkg.updated.time).toLocaleString()} by {pkg.updated.name}.
                    </h1>
                    <h1 className='text-xs text-shallow-dark p-1 pl-2 w-full rounded-lg h-[2vh] outline-none'>
                        Created {new Date(pkg.created.time).toLocaleString()} by {pkg.created.name}.
                    </h1>
                </div>
            </div>
            <button
                onClick={handleSave}
                className={`${isEdited() ? 'bg-blue-500' : 'bg-gray-900 cursor-not-allowed'} w-40 h-10 rounded-lg absolute bottom-6 right-6 px-6 py-2${isEdited() ? 'text-foreground cursor-pointer' : 'text-shallow'}`}
            >
                <h1>Save</h1>
            </button>
            <h1 className='absolute top-6 right-6 cursor-pointer' onClick={() => setEditing(false)}>❌</h1>
        </div>
    )
}

/**
 * Displays a entry of the package changelog
 * 
 * @param change Changelog object
 * @param url IMAGE_URL to display the user avatar
 * 
 * @returns React component 
 */
function Change({ change, url }: ChangeProps) {
    const imageExists = url && change.author.avatar !== 'null'
    return (
        <div className='flex items-center gap-2 p-1 px-2 bg-light rounded-lg'>
            <h1 className='min-w-[14px] max-w-[14px]'>{change.id}</h1>
            <div className='relative min-w-[35px] max-w-[35px] h-[35px] self-center cursor-pointer rounded-full overflow-hidden'>
                {imageExists ? <Image
                    src={`${url}/${change.author.id}/${change.author.avatar}.png?size=64`}
                    alt='Profile Icon'
                    fill={true}
                /> : <ProfileIcon />}
            </div>
            <h1 className='min-w-[6vw] max-w-[6vw]'>{change.author.name}</h1>
            <h1 className='text-pretty'>{change.event}</h1>
            <h1 className='min-w-[110px] max-w-[110px]'>{new Date(change.timestamp).toLocaleString()}</h1>
        </div>
    )
}
