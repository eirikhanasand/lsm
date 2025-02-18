import getPackages from "@/utils/filtering/getPackage"
import AddPage from "@/components/addPage"

export default async function page() {
    const list = 'whitelist'
    const packages = await getPackages({list, side: 'server'})
    return <AddPage list={list} packages={packages} />
}
