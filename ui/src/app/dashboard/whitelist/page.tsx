import getPackages from "@/utils/filtering/getPackage"
import fetchRepositories from "@/utils/fetchRepositories"
import AddPage from "@/components/addPage"

export default async function page() {
    const list = 'whitelist'
    const packages = await getPackages({list, side: 'server'})
    console.log("whitelisted packages", packages)
    const repositories = await fetchRepositories()
    return <AddPage list={list} packages={packages} repositories={repositories} />
}
