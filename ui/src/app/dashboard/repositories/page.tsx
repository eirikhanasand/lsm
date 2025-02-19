import Link from "next/link";
import fetchRepositories from "@/utils/fetchRepositories"

type Repository = {
    key: string
    description: string
    type: "LOCAL" | "REMOTE" | "VIRTUAL"
    url: string
    packageType: string
}

type RepositoryProps = {
    repository: Repository
    index: number
}

export default async function Repositories() {
    const repositories: Repository[] = await fetchRepositories()
    return (
        <main className="min-h-full w-full flex flex-col p-4">
            <h1 className="text-3xl font-bold text-blue-600">Repositories</h1>
            <p className="mt-2 text-foreground mb-2">List of repositories in Artifactory.</p>
            <div className="grid grid-cols-8 bg-normal w-full h-[50px] items-center pl-4 text-foreground">
                <h1>Key</h1>
                <h1>Type</h1>
                <h1 className="col-span-2">URL</h1>
                <h1>Package Type</h1>
                <h1 className="col-span-3">Description</h1>
            </div>
            <div className="h-full w-full">
                {repositories.map((repository, index) => <Repository 
                    key={JSON.stringify(repository)} 
                    repository={repository} 
                    index={index}
                />)}
            </div>
        </main>
    )
}

function Repository({repository, index}: RepositoryProps) {
    const color = index % 2 !== 0 ? 'bg-normal' : ''
    return (
        <div className={`w-full grid grid-cols-8 ${color} p-4 text-foreground`}>
            <Link
                href={`/dashboard/repositories/config/${repository.key}`}
                className="text-blue-500 underline">{repository.key}
            </Link>
            <h1>{repository.type}</h1>
            <h1 className="col-span-2">{repository.url}</h1>
            <h1>{repository.packageType}</h1>
            <h1 className="col-span-3">{repository.description}</h1>
        </div>
    )
}
