import fetchRepositories from "@/utils/fetchRepositories"
import ClientPage from './clientPage'
import { headers } from "next/headers"

export default async function Repositories() {
    const repositories: Repository[] = await fetchRepositories()
    const userAgent = (await headers()).get('user-agent') || ""
    return <ClientPage repositories={repositories} userAgent={userAgent} />
}
