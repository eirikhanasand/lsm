type Package = {
    name: string
    version: string
    ecosystem: string
    repository: string | null
    comment: string
    author: string
    createdAt: string
    createdBy: string
    updatedAt: string
    updatedBy: string
    changeLog: ChangeLog[]
}

type AddPackage = {
    name: string
    version: string
    ecosystem: string
    repository: string | null
    comment: string
    author: string
}

type APIPackage = {
    name: string
    versions: string[]
    ecosystems: string[]
    repositories: string[]
    comments: string[]
    authors: string[]
    createdAt: string
    createdBy: string
    updatedAt: string
    updatedBy: string
    changeLog: ChangeLog[]
}

type Repository = {
    key: string
    description: string
    type: "LOCAL" | "REMOTE" | "VIRTUAL"
    url: string
    packageType: string
}

type Cookie = {
    name: string
    value: string
}

type ClientPageProps = {
    list: 'whitelist' | 'blacklist'
    packages: APIPackage[]
    repositories: Repository[]
}

type RepoWhitelistItem = {
    name: string
    versions: string[]       
    ecosystems: string[]  
    repositories: string[]  
    comments: string[] 
    isGlobal?: boolean 
}

type RepoBlacklistItem = {
    name: string
    versions: string[]      
    ecosystems: string[]    
    repositories: string[]  
    comments: string[]     
    isGlobal?: boolean  
}

type RepoConfig = {
    whitelist: RepoWhitelistItem[]
    blacklist: RepoBlacklistItem[]
}

type User = {
    avatar: string
    email: string
    id: string
    locale: string
    mfa_enabled: boolean
    token: string
    username: string
    verified: boolean
}

type StatisticResponse = {
    totalScanned: number
    vulnerabilitiesFound: number
    criticalBlocked: number
    safeApproved: number
    lastScan: string | null
    repositoryStats: Statistics[]
    vulnerabilitiesOverTime: Vulnerability[]
}

type Statistics = {
    repository: string
    ecosystem: string
    scanned: number
    vulnerabilities: number
    blocked: number
    safe: number
}

type Vulnerability = {
    timestamp: string
    severity: number
    repository: string
    ecosystem: string
    reason: string
}

type GetStatisticProps = {
    timeStart: string
    timeEnd: string
}

type AuditProps = {
    id: number
    event: string
    author: string
    name: string
    image: string
    timestamp: string
}

type ChangeLog = {
    name: string
    event: string
    author: string
    timestamp: string
    image: string
    id: string
}

type Ecosystem = 
    "ansible" |
    "alpine" |
    "bower" | 
    "cargo" |
    "chef" |
    "cocoapods" |
    "composer" |
    "conan" |
    "cran" |
    "debian" |
    "docker" |
    "gems" |
    "gitlfs" |
    "go" |
    "gradle" |
    "helm" |
    "ivy" |
    "maven" |
    "npm" |
    "nuget" |
    "oci" |
    "opkg" |
    "p2" |
    "pub" |
    "puppet" |
    "pypi" |
    "rpm" |
    "sbt" |
    "swift" |
    "terraform" |
    "vagrant" |
    "yum" |
    "generic"
