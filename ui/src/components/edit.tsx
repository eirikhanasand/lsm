import { Dispatch, SetStateAction, useState } from "react"
import editPackage from "@/utils/filtering/editPackage"
import Image from "next/image"
import Dropdown from "./dropdown"
import { ECOSYSTEMS } from "@parent/constants"

type EditProps = {
    pkg: Package
    setEditing: Dispatch<SetStateAction<boolean>>
    list: 'whitelist' | 'blacklist'
    packages: Package[]
    setPackages: Dispatch<SetStateAction<Package[]>>
    author: Author
    repositories: Repository[]
}

export default function Edit({pkg, setEditing, setPackages, packages, list, author, repositories: serverRepositories}: EditProps) {
    const [versions, setVersions] = useState(pkg.versions)
    const [ecosystems, setEcosystems] = useState(pkg.ecosystems)
    const [repositories, setRepositories] = useState(pkg.repositories)
    const [references, setReferences] = useState(pkg.references)
    const [comment, setComment] = useState(pkg.comment)

    function parseRepositories() {
        return repositories
            .map((repository) => repository.includes('] ') ? repository.split('] ')[1] : repository)
    }

    function isEdited() {
        return !(JSON.stringify(versions) === JSON.stringify(pkg.versions)
            && JSON.stringify(ecosystems) === JSON.stringify(pkg.ecosystems)
            && JSON.stringify(parseRepositories()) === JSON.stringify(pkg.repositories)
            && JSON.stringify(references) === JSON.stringify(pkg.references)
            && JSON.stringify(comment) === JSON.stringify(pkg.comment))
    }

    function handleSave() {
        if (isEdited()) {
            editPackage({pkg: {
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
            }, setPackages, packages, list, author})
        }
    }

    return (
        <div 
            className="w-[100vw] h-[100vh] fixed left-0 top-0 grid place-items-center bg-black/80 grid-cols-10 gap-4 p-6 z-100"
            onClick={() => setEditing(false)}
        >
            <div 
                className="relative w-full h-full bg-normal rounded-xl p-4 col-span-4"
                onClick={(event) => event.stopPropagation()}
            >
                <h1 className="text-md font-semibold flex-grow">
                    Editing package &quot;{pkg.name}&quot;
                </h1>

                <div className="flex pt-3">
                    <div className="w-[140px] max-w-[140px] space-y-2">
                        <h1 className="text-sm pt-2 p-1 w-full h-[4vh]">Versions</h1>
                        <h1 className="text-sm pt-2 p-1 w-full h-[4vh]">Ecosystems</h1>
                        <h1 className="text-sm pt-2 p-1 w-full h-[4vh]">Repositories</h1>
                        <h1 className="text-sm pt-2 p-1 w-full h-[4vh]">Comment</h1>
                        <h1 className="text-sm pt-2 p-1 w-full h-[4vh]">References</h1>
                    </div>
                    <div className="w-full space-y-2">
                        <input
                            className="text-sm bg-light p-1 pl-2 w-full rounded-lg h-[4vh] outline-none caret-blue-500"
                            value={versions.join(', ')}
                            type="text"
                            placeholder={`Versions to ${list}`}
                            onChange={(event) => setVersions(event.target.value.split(','))}
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
                            className="text-sm bg-light p-1 pl-2 w-full rounded-lg h-[4vh] outline-none caret-blue-500"
                            value={repositories.join(', ')}
                            type="text"
                            placeholder="Repositories affected"
                            onChange={(event) => setRepositories(event.target.value.split(','))}
                        />
                        <input
                            className="text-sm bg-light p-1 pl-2 w-full rounded-lg min-h-[4vh] outline-none caret-blue-500"
                            value={references.join(', ')}
                            type="text"
                            placeholder="References"
                            onChange={(event) => setReferences(event.target.value.split(','))}
                        />
                        <input
                            className="text-sm bg-light p-1 pl-2 w-full rounded-lg min-h-[4vh] outline-none caret-blue-500"
                            value={comment}
                            type="text"
                            placeholder="Comment"
                            onChange={(event) => setComment(event.target.value)}
                        />
                    </div>
                </div>
            </div>
            <div className="w-full h-full bg-normal rounded-xl p-4 col-span-4">
                <h1 className="text-md font-semibold w-full h-[4vh]">Changelog</h1>
                <h1 className="text-xs text-shallow-dark bg-light p-1 pl-2 w-full rounded-lg min-h-[4vh] outline-none">
                    {pkg.changeLog.map((change) => <Change key={change.id} change={change} />)}
                </h1>
                <div>
                    <h1 className="text-xs text-shallow-dark p-1 pl-2 w-full rounded-lg h-[2vh] outline-none mt-2">
                        Authored by {pkg.authors.map((author) => author.name).join(', ')}.
                    </h1>
                    <h1 className="text-xs text-shallow-dark p-1 pl-2 w-full rounded-lg h-[2vh] outline-none">
                        Updated {new Date(pkg.updated.time).toLocaleString()} by {pkg.updated.name}.
                    </h1>
                    <h1 className="text-xs text-shallow-dark p-1 pl-2 w-full rounded-lg h-[2vh] outline-none">
                        Created {new Date(pkg.created.time).toLocaleString()} by {pkg.created.name}.
                    </h1>
                </div>
            </div>
            <button
                onClick={handleSave}
                className={`${isEdited() ? 'bg-blue-500' : 'bg-gray-900 cursor-not-allowed'} w-40 h-10 rounded-lg absolute bottom-6 right-6 px-6 py-2${isEdited() ? "text-foreground cursor-pointer" : "text-shallow"}`}
            >
                <h1>Save</h1>
            </button>  
            <h1 className="absolute top-6 right-6 cursor-pointer" onClick={() => setEditing(false)}>❌</h1>
        </div>
    )
}

function Change({change}: {change: ChangeLog}) {
    return <div className="flex items-center gap-2 p-1">
        <h1>{change.id}</h1>
        <div className='relative w-[7.5vh] h-[3.5vh] self-center cursor-pointer rounded-full overflow-hidden'>
            <Image src={`https://cdn.discordapp.com/avatars/${change.author.id}/${change.author.avatar}.png?size=64`} alt="logo" fill={true} />
        </div>
        <h1 className="w-[15vw]">{change.author.name}</h1>
        <h1 className="text-pretty">{change.event}</h1>
        <h1 className="w-[16vw]">{new Date(change.timestamp).toLocaleString()}</h1>
    </div>
}
