import SettingsClient from "@/components/settingsClient"
import fetchRepositories from "@/utils/fetchRepositories"

export default async function Settings() {
    const repositories = await fetchRepositories()
    return <SettingsClient repositories={repositories} />
}
