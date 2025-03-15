import getPackages from "@/utils/filtering/getPackage"
import fetchRepositories from "@/utils/fetchRepositories"
import AddPackage from "@/components/addPackage"

export default async function page() {
    const list = 'blacklist'
    const packages = await getPackages({list, side: 'server'})
    const repositories = await fetchRepositories()
    return <AddPackage list={list} packages={packages} repositories={repositories} />
}
