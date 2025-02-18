import { SetStateAction, useState } from "react"
import Pencil from "./svg/pencil"

type EditProps = {
    pkg: APIPackage
    setEditing: (value: SetStateAction<boolean>) => void
}

export default function Edit({pkg, setEditing}: EditProps) {
    const [versions, setVersions] = useState(pkg.versions)
    const [ecosystems, setEcosystems] = useState(pkg.ecosystems)
    const [repositories, setRepositories] = useState(pkg.repositories)
    const [comments, setComments] = useState(pkg.comments)

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
                <div className="grid grid-cols-2">
                    <div className="w-[20px]">
                        <h1>Versions</h1>
                        <h1>Ecosystems</h1>
                        <h1>Repositories</h1>
                        <h1>Comments</h1>
                    </div>
                    <div className="w-full space-y-2">
                        <input
                            className="text-sm bg-light p-1 pl-2 w-full rounded-lg h-[4vh] outline-none caret-orange-500"
                            value={versions.join(',')}
                            type="text"
                            placeholder="Versions to whitelist"
                            onChange={(event) => setVersions(event.target.value.split(','))}
                        />
                        <input
                            className="text-sm bg-light p-1 pl-2 w-full rounded-lg h-[4vh] outline-none caret-orange-500"
                            value={ecosystems.join(',')}
                            type="text"
                            placeholder="Versions to whitelist"
                            onChange={(event) => setEcosystems(event.target.value.split(','))}
                        />
                        <input
                            className="text-sm bg-light p-1 pl-2 w-full rounded-lg h-[4vh] outline-none caret-orange-500"
                            value={repositories.join(',')}
                            type="text"
                            placeholder="Repositories affected"
                            onChange={(event) => setRepositories(event.target.value.split(','))}
                        />
                        <input
                            className="text-sm bg-light p-1 pl-2 w-full rounded-lg h-[4vh] outline-none caret-orange-500"
                            value={comments.join(',')}
                            type="text"
                            placeholder="Comment"
                            onChange={(event) => setComments(event.target.value.split(','))}
                        />
                    </div>
                </div>
                <button
                    onClick={(() => setEditing(true))}
                    // onClick={() => editPackage({pkg, setPackages, packages, list})}
                    className="h-[20px] w-[20px] justify-self-end"
                >
                    <Pencil
                        fill="fill-shallow hover:fill-green-500"
                        className="pencil-icon max-w-[16px] max-h-[16px] mb-[1.7px]"
                    />
                </button>  
            </div>
        </div>
    )
}
