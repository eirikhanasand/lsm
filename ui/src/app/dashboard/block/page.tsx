import getPackages from '@/utils/filtering/getPackage'
import fetchRepositories from '@/utils/fetchRepositories'
import AddPackage from '@/components/package/addPackage'
import { cookies } from 'next/headers'
import config from '@parent/constants'

const { IMAGE_URL } = config

/**
 * Server side list of `block` entries to display in the user interface. 
 * Prerenders the content to ensure that it is available to the user right away.
 * The user has filters and paging to filter the results.
 * 
 * @returns React component
 */
export default async function page() {
    const list = 'block'
    const serverPackages = await getPackages({ list, side: 'server' })
    const packages = Array.isArray(serverPackages) ? serverPackages : []
    const repositories = await fetchRepositories({})
    const Cookies = await cookies()
    const showGlobalOnly = Cookies.get('showGlobalOnly')?.value || 'false'
    return <AddPackage
        list={list}
        pages={serverPackages.pages}
        packages={packages}
        repositories={repositories.result}
        serverShowGlobalOnly={showGlobalOnly === 'true'}
        url={IMAGE_URL}
    />
}
