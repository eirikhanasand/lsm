import getPackages from "@/utils/filtering/getPackage"
import ClientPage from "./clientPage"

export default async function page() {
    const packages = await getPackages({list: 'whitelist', side: 'server'})
    return (
        <ClientPage packages={packages} />
    )
}
