import config from '@parent/constants'

const { SERVER_API } = config

/**
 * Fetches the `allow` and `block` list entries for the selected repository. 
 * Used for the `/repositories/config/[repo]` path in the user interface.
 * @param repository Repository in question
 * @returns `allow` and `block` list entries for the selected repository.
 */
export default async function fetchRepoConfig(repository: string): Promise<RepoConfig> {
    const params = new URLSearchParams({ repository: encodeURIComponent(repository) })
    try {
        // Fetches the API
        const [allowRes, blockRes] = await Promise.all([
            fetch(`${SERVER_API}/list/allow?${params}`),
            fetch(`${SERVER_API}/list/block?${params}`)
        ])

        if (!allowRes.ok) {
            const allowErrorText = await allowRes.text()
            throw new Error(`Error fetching allowed packages: ${allowErrorText}`)
        }
        if (!blockRes.ok) {
            const blockErrorText = await blockRes.text()
            throw new Error(`Error fetching blocked packages: ${blockErrorText}`)
        }

        // Converts the response to JSON
        const [allowRaw, blockRaw] = await Promise.all([
            allowRes.json(),
            blockRes.json()
        ])

        // Maps the results to determine whether they are `global`
        // (ecosystem independant).
        const allow = allowRaw.result.map((item: RepoAllowItem) => ({
            ...item,
            isGlobal: item.repositories.length === 0
        }))

        const block = blockRaw.result.map((item: RepoBlockItem) => ({
            ...item,
            isGlobal: item.repositories.length === 0
        }))

        return { allow, block }
    } catch (error) {
        console.error(`Error fetching repository config: ${error}`)
        return { allow: [], block: [] }
    }
}
