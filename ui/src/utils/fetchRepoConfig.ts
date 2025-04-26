import config from '@parent/constants'

const { SERVER_API } = config

export default async function fetchRepoConfig(repository: string): Promise<RepoConfig> {
    const params = new URLSearchParams({ repository: encodeURIComponent(repository) })
    try {
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

        const [allowRaw, blockRaw] = await Promise.all([
            allowRes.json(),
            blockRes.json()
        ])

        const allow = allowRaw.map((item: RepoAllowItem) => ({
            ...item,
            isGlobal: item.repositories.length === 0
        }))

        const block = blockRaw.map((item: RepoBlockItem) => ({
            ...item,
            isGlobal: item.repositories.length === 0
        }))

        return { allow, block }
    } catch (error) {
        console.error(`Error fetching repository config: ${error}`)
        return { allow: [], block: [] }
    }
}
