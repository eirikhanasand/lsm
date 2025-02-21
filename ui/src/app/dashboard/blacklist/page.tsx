import getPackages from "@/utils/filtering/getPackage"
import fetchRepositories from "@/utils/fetchRepositories"
import AddPage from "@/components/addPage"

export default async function page() {
    const list = 'blacklist'
    const packages = await getPackages({list, side: 'server'})
    const repositories = await fetchRepositories()
    return <AddPage list={list} packages={packages} repositories={repositories} />
}
