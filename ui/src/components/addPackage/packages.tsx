import { Dispatch, SetStateAction } from "react"
import Package from "./package"

type PackagesProps = {
    groupedPackages: Record<string, Package[]>
    list: "white" | "black"
    setPackages: Dispatch<SetStateAction<Package[]>>
    packages: Package[]
    author: Author
    repositories: Repository[]
}

export default function Packages({groupedPackages, list, setPackages, packages, author, repositories}: PackagesProps) {
    return Object.keys(groupedPackages)
        .sort()
        .map((ecosystem) => (
            <div key={ecosystem} className="w-full">
                <h2 className="text-xl font-bold text-blue-500">{ecosystem}</h2>
                <ul
                    className="grid gap-4 w-full"
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
                        />
                    ))}
                </ul>
            </div>
        ))
}
