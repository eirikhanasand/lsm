import fetchRepositories from '@/utils/fetchRepositories'
import ClientPage from './clientPage'

export default async function Repositories() {
    const repositories = await fetchRepositories({})
    return <ClientPage 
        pages={repositories.pages}
        repositories={repositories.result}
    />
}
