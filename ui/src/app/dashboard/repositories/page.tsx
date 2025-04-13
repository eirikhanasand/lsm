import fetchRepositories from "@/utils/fetchRepositories"
import ClientPage from './clientPage'

export default async function Repositories() {
    const repositories: Repository[] = await fetchRepositories()
    return <ClientPage repositories={repositories} />
}
