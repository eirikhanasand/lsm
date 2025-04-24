type OSVHandlerParams = {
    name: string
    comment: string
    version: string
    ecosystem: string
    repository: string
    references: string[]
    author: Author
}

type CVEHandlerParams = {
    name: string
}

type Statistics = {
    ecosystem: string
    scanned: number
    vulnerabilities: number
    blocked: number
    safe: number
}

type Vulnerability = {
    package_name: string
    timestamp: string
    severity: number
    repository: string
    ecosystem: string
    reason: string
}

type UserParams = {
    id: string
    name: string
    image: string
}

type User = {
    id: string
    name: string
    avatar: string
}

type UpdateBody = {
    name: string
    comment: string
    versions: string[]
    ecosystems: string[]
    repositories: string[]
    references: string[]
    author: User
}

type PostBody = {
    name: string
    comment: string
    versions: string[]
    ecosystems: string[]
    repositories: string[]
    references: string[]
    author: Author
}

type OSVResponse = {
    vulnerabilties: OSVResponseVulnerability[]
    whitelist?: any[]
    blacklist?: any[]
}

type OSVResponseVulnerability = {
    id?: string
    details?: string
    name: string
    package_name: string
    ecosystem: string
    version_introduced: string
    version_fixed: string
    aliases: string[]
} & WorkerVulnerability

type ProcessedOSVVulnerability = {
    id?: string
    details?: string
    name: string
    package_name: string
    ecosystem: string
    version_introduced: string
    version_fixed: string
    aliases: string[]
} & WorkerVulnerability

type WorkerVulnerability = {
    id: string
    summary: string
    details: string
    aliases: string[]
    modified: string
    published: string
    database_specific: {
        'malicious-packages-origins': Package[]
        severity: Severity
        cwe_ids: string[]
    }
    references: Reference[]
    affected: Affected[]
    schema_version: string
    credits: Credit[]
    severity?: Severity[]
}

type Reference = {
    type: string
    url: string
}

type Package = {
    sha256: string
    ranges: PackageRange[]
    source: string
    id: string
    import_time: string
    modified_time: string
}

type PackageRange = {
    type: string
    events: (Introduced | IntroducedAndFixed)[]
}

type IntroducedAndFixed = [
    { introduced: string },
    { fixed: string }
]

type Introduced = [
    { introduced: string }
]

type Affected = {
    package: {
        name: string
        ecosystem: string
        purl: string
    }
    ranges?: PackageRange[]
    versions?: string[]
    database_specific: {
        source: string
        cwes: {
            name: string
            cweId: string
            description: string
        }
    }
}

type Credit = {
    name: string
    contact: string[]
    type: string
}

type Severity = {
    type: string
    score: string
}

type WorkerData = {
    repoPath: KeyPathID
    originalRepoPath: KeyPathID
    name: string
    servletContextUrl: string
    uri: string
    clientAddress: string
    repoType: number
}

type KeyPathID = {
    key: string
    path: string
    id: string
}

type ProcessVulnerabiltiesProps = {
    response: OSVResponse
    name: string
    version: string
    ecosystem: string
    clientAddress: string
}

type DownloadEvent = {
    package_name: string
    package_version: string
    ecosystem: string
    client_address: string
    status: DownloadStatus
    reason: string,
    severity: string
}

type FetchOSVProps = {
    name: string
    version: string
    ecosystem: string
    clientAddress: string
}

type FetchOSVResponse = {
    response: OSVResponse
    whitelist?: any[]
    blacklist?: any[]
    osvLength: number
}

type ListQueryProps = {
    ecosystem?: string
    name?: string
    page?: number
    resultsPerPage?: number
    version?: string
    repository?: string
    startDate?: string
    endDate?: string
}

type AuditLogQueryProps = {
    author?: string
    startDate?: string
    endDate?: string
    ecosystem?: string
    name?: string
    page?: string
    resultsPerPage?: number
    version?: string
    list?: 'white' | 'black'
}
