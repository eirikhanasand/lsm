// src/utils/fetchRepoConfig.ts
export interface RepoWhitelistItem {
    name: string
    versions: string[]       
    ecosystems: string[]  
    repositories: string[]  
    comments: string[]  
}

export interface RepoBlacklistItem {
    name: string
    versions: string[]      
    ecosystems: string[]    
    repositories: string[]  
    comments: string[]       
}

export interface RepoConfig {
    whitelist: RepoWhitelistItem[]
    blacklist: RepoBlacklistItem[]
}

export default async function fetchRepoConfig(
    repository: string
): Promise<RepoConfig> {
    try {
        const [whitelistRes, blacklistRes] = await Promise.all([
            fetch(
                `http://localhost:8080/api/whitelist/${repository}`
            ),
            fetch(
                `http://localhost:8080/api/blacklist/${repository}`
            ),
        ])

        if (!whitelistRes.ok) {
            const whitelistErrorText = await whitelistRes.text()
            throw new Error(`Error fetching whitelist: ${whitelistErrorText}`)
        }
        if (!blacklistRes.ok) {
            const blacklistErrorText = await blacklistRes.text()
            throw new Error(`Error fetching blacklist: ${blacklistErrorText}`)
        }

        const [whitelist, blacklist] = await Promise.all([
            whitelistRes.json(),
            blacklistRes.json(),
        ])

        return { whitelist, blacklist }
    } catch (error) {
        console.error(`Error fetching repository config: ${error}`)
        return { whitelist: [], blacklist: [] }
    }
}
