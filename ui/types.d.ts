type AddPackage = {
    name: string
    comment: string
    versions: string[]
    ecosystems: string[]
    repositories: string[]
    references: string[]
    author: Author
}

type PutPackage = {
    name: string
    versions: string[]
    ecosystems: string[]
    repositories: string[]
    comment: string
    references: string[]
    author: Author
}

type Package = {
    name: string
    comment: string
    versions: string[]
    ecosystems: string[]
    repositories: string[]
    references: string[]
    authors: Author[]
    created: Author & { time: string }
    updated: Author & { time: string }
    changeLog: ChangeLog[]
}

type Repository = {
    key: string
    description: string
    type: 'LOCAL' | 'REMOTE' | 'VIRTUAL'
    url: string
    packageType: string
}

type Cookie = {
    name: string
    value: string
}

type ClientPageProps = {
    list: 'allow' | 'block'
    packages: APIPackage[]
    repositories: Repository[]
    serverShowGlobalOnly: boolean
}

type RepoAllowItem = {
    name: string
    versions: string[]       
    ecosystems: string[]  
    repositories: string[]  
    comment: string 
    isGlobal?: boolean 
}

type RepoBlockItem = {
    name: string
    versions: string[]      
    ecosystems: string[]    
    repositories: string[]  
    comment: string
    isGlobal?: boolean  
}

type RepoConfig = {
    allow: RepoAllowItem[]
    block: RepoBlockItem[]
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
    lastScan: string
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
    ecosystem: string
    reason: string
}

type GetStatisticProps = {
    startTime: string
    endTime: string
}

type AuditProps = {
    pages: number
    resultsPerPage: number
    results: AuditResult[]
}

type AuditResult = {
    id: number
    event: string
    author: Author
    timestamp: string
}

type ChangeLog = {
    name: string
    event: string
    author: Author
    timestamp: string
    id: string
}

type Author = {
    id: string
    name: string
    avatar: string
}

type Ecosystem = 
    'ansible' |
    'alpine' |
    'bower' | 
    'cargo' |
    'chef' |
    'cocoapods' |
    'composer' |
    'conan' |
    'cran' |
    'debian' |
    'docker' |
    'gems' |
    'gitlfs' |
    'go' |
    'gradle' |
    'helm' |
    'ivy' |
    'maven' |
    'npm' |
    'nuget' |
    'oci' |
    'opkg' |
    'p2' |
    'pub' |
    'puppet' |
    'pypi' |
    'rpm' |
    'sbt' |
    'swift' |
    'terraform' |
    'vagrant' |
    'yum' |
    'generic'

type Repository = {
    key: string
    description: string
    type: 'LOCAL' | 'REMOTE' | 'VIRTUAL'
    url: string
    packageType: string
}

type RepositoryProps = {
    repository: Repository
    index: number
}

type RepoListItem = {
    name: string
    versions: string[]       
    ecosystems: string[]  
    repositories: string[]  
    comment: string
    isGlobal?: boolean 
}

type RepoConfig = {
    allow: RepoListItem[]
    block: RepoListItem[]
}
