import { SetStateAction, useState } from "react"
import editPackage from "@/utils/filtering/editPackage"

type EditProps = {
    pkg: APIPackage
    setEditing: (value: SetStateAction<boolean>) => void
    list: 'whitelist' | 'blacklist'
    packages: APIPackage[]
    setPackages: (value: SetStateAction<APIPackage[]>) => void
}

export default function Edit({pkg, setEditing, setPackages, packages, list}: EditProps) {
    const [versions, setVersions] = useState(pkg.versions)
    const [ecosystems, setEcosystems] = useState(pkg.ecosystems)
    const [repositories, setRepositories] = useState(pkg.repositories)
    const [comments, setComments] = useState(pkg.comments)

    function isEdited() {
        return !(JSON.stringify(versions) === JSON.stringify(pkg.versions)
            && JSON.stringify(ecosystems) === JSON.stringify(pkg.ecosystems)
            && JSON.stringify(repositories) === JSON.stringify(pkg.repositories)
            && JSON.stringify(comments) === JSON.stringify(pkg.comments))
    }

    function handleSave() {
        if (isEdited()) {
            editPackage({pkg: {
                name: pkg.name,
                versions,
                ecosystems,
                repositories,
                comments
            }, setPackages, packages, list})
        }
    }

    return (
        <div 
            className="w-full h-full absolute left-0 top-0 grid place-items-center bg-black/80"
            onClick={() => setEditing(false)}
        >
            <div 
                className="grid w-[35vw] h-[45vh] bg-dark rounded-lg p-8 overflow-auto noscroll"
                onClick={(event) => event.stopPropagation()}
            >
                <h1 className="text-md text-center font-semibold mb-2">Editing package &quot;{pkg.name}&quot;</h1>
                <div className="flex">
                    <div className="w-[140px] max-w-[140px] space-y-2">
                        <h1 className="text-sm pt-2 p-1 pl-2 w-full h-[4vh]">Versions</h1>
                        <h1 className="text-sm pt-2 p-1 pl-2 w-full h-[4vh]">Ecosystems</h1>
                        <h1 className="text-sm pt-2 p-1 pl-2 w-full h-[4vh]">Repositories</h1>
                        <h1 className="text-sm pt-2 p-1 pl-2 w-full h-[4vh]">Comments</h1>
                    </div>
                    <div className="w-full space-y-2">
                        <input
                            className="text-sm bg-light p-1 pl-2 w-full rounded-lg h-[4vh] outline-none caret-blue-500"
                            value={versions.join(',')}
                            type="text"
                            placeholder="Versions to whitelist"
                            onChange={(event) => setVersions(event.target.value.split(','))}
                        />
                        <input
                            className="text-sm bg-light p-1 pl-2 w-full rounded-lg h-[4vh] outline-none caret-blue-500"
                            value={ecosystems.join(',')}
                            type="text"
                            placeholder="Versions to whitelist"
                            onChange={(event) => setEcosystems(event.target.value.split(','))}
                        />
                        <input
                            className="text-sm bg-light p-1 pl-2 w-full rounded-lg h-[4vh] outline-none caret-blue-500"
                            value={repositories.join(',')}
                            type="text"
                            placeholder="Repositories affected"
                            onChange={(event) => setRepositories(event.target.value.split(','))}
                        />
                        <input
                            className="text-sm bg-light p-1 pl-2 w-full rounded-lg h-[4vh] outline-none caret-blue-500"
                            value={comments.join(',')}
                            type="text"
                            placeholder="Comment"
                            onChange={(event) => setComments(event.target.value.split(','))}
                        />
                    </div>
                </div>
                <button
                    onClick={handleSave}
                    className={`h-[20px] w-[20px] justify-self-end pr-10 ${isEdited() ? "text-foreground hover:text-green-500 cursor-pointer" : "text-shallow"}`}
                >
                    <h1>Save</h1>
                </button>  
            </div>
        </div>
    )
}
