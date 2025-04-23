import getPackages from '@/utils/filtering/getPackage'
import fetchRepositories from '@/utils/fetchRepositories'
import AddPackage from '@/components/addPackage/addPackage'
import { cookies } from 'next/headers'

export default async function page() {
    const list = 'white'
    const packages = await getPackages({ list, side: 'server' })
    const repositories = await fetchRepositories()
    const Cookies = await cookies()
    const showGlobalOnly = Cookies.get('showGlobalOnly')?.value || 'false'
    return <AddPackage
        list={list}
        packages={packages}
        repositories={repositories}
        serverShowGlobalOnly={showGlobalOnly === 'true'}
    />
}
