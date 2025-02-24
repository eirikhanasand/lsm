import { SERVER_API } from "@parent/constants"

export interface RepoWhitelistItem {
    name: string
    versions: string[]       
    ecosystems: string[]  
    repositories: string[]  
    comments: string[] 
    isGlobal?: boolean 
}

export interface RepoBlacklistItem {
    name: string
    versions: string[]      
    ecosystems: string[]    
    repositories: string[]  
    comments: string[]     
    isGlobal?: boolean  
}

export interface RepoConfig {
    whitelist: RepoWhitelistItem[]
    blacklist: RepoBlacklistItem[]
}

export default async function fetchRepoConfig(repository: string): Promise<RepoConfig> {
    try {
        const [whitelistRes, blacklistRes] = await Promise.all([
            fetch(
                `${SERVER_API}/whitelist/${repository}`
            ),
            fetch(
                `${SERVER_API}/blacklist/${repository}`
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

        console.log(whitelist,blacklist)
        return { whitelist, blacklist }
    } catch (error) {
        console.error(`Error fetching repository config: ${error}`)
        return { whitelist: [], blacklist: [] }
    }
}
