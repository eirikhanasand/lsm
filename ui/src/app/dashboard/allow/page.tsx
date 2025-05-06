import getPackages from '@/utils/filtering/getPackage'
import fetchRepositories from '@/utils/fetchRepositories'
import AddPackage from '@/components/package/addPackage'
import { cookies } from 'next/headers'

export default async function page() {
    const list = 'allow'
    const serverPackages = await getPackages({ list, side: 'server' })
    const packages = Array.isArray(serverPackages.result) ? serverPackages.result : []
    const repositories = await fetchRepositories({})
    const Cookies = await cookies()
    const showGlobalOnly = Cookies.get('showGlobalOnly')?.value || 'false'
    return <AddPackage
        pages={serverPackages.pages}
        list={list}
        packages={packages}
        repositories={repositories.result}
        serverShowGlobalOnly={showGlobalOnly === 'true'}
    />
}
