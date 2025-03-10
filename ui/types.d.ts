type Package = {
    name: string
    version: string
    ecosystem: string
    repository: string | null
    comment: string
}

type APIPackage = {
    name: string
    versions: string[]
    ecosystems: string[]
    repositories: string[]
    comments: string[]
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
