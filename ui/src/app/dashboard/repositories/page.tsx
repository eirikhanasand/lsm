import fetchRepositories from '@/utils/fetchRepositories'
import ClientPage from './clientPage'

/**
 * Server side repositories. Prefetches the repositories from JFrog Artifactory
 * to ensure that they are available immediately when the page is loaded.
 * 
 * @returns React component
 */
export default async function Repositories() {
    const repositories = await fetchRepositories({})
    return <ClientPage 
        pages={repositories.pages}
        repositories={repositories.result}
    />
}
