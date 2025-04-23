import config from '@parent/constants'

const { SERVER_API } = config

export default async function fetchRepoConfig(repository: string): Promise<RepoConfig> {
    const params = new URLSearchParams({ repository: encodeURIComponent(repository) })
    try {
        const [whitelistRes, blacklistRes] = await Promise.all([
            fetch(`${SERVER_API}/list/white?${params}`),
            fetch(`${SERVER_API}/list/black?${params}`)
        ])

        if (!whitelistRes.ok) {
            const whitelistErrorText = await whitelistRes.text()
            throw new Error(`Error fetching whitelist: ${whitelistErrorText}`)
        }
        if (!blacklistRes.ok) {
            const blacklistErrorText = await blacklistRes.text()
            throw new Error(`Error fetching blacklist: ${blacklistErrorText}`)
        }

        const [whitelistRaw, blacklistRaw] = await Promise.all([
            whitelistRes.json(),
            blacklistRes.json()
        ])

        const whitelist = whitelistRaw.map((item: RepoWhitelistItem) => ({
            ...item,
            isGlobal: item.repositories.length === 0
        }))

        const blacklist = blacklistRaw.map((item: RepoBlacklistItem) => ({
            ...item,
            isGlobal: item.repositories.length === 0
        }))

        return { whitelist, blacklist }
    } catch (error) {
        console.error(`Error fetching repository config: ${error}`)
        return { whitelist: [], blacklist: [] }
    }
}
