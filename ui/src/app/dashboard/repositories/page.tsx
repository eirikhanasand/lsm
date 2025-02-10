// import fetchRepositories from "@/utils/fetchRepositories"

export default async function Repositories() {
    // const repositories: {[key: string]: string}[] = await fetchRepositories()
    return (
        <main className="flex min-h-screen flex-col items-center justify-center bg-white p-4">
            <h1 className="text-3xl font-bold text-blue-600">Repositories</h1>
            <p className="mt-2 text-gray-700">List over repositories in Artifactory.</p>
            {/* {repositories.map((repository) => <div key={JSON.stringify(repository)}>{JSON.stringify(repository)}</div>)} */}
        </main>
    )
}
