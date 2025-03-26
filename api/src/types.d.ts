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
    repository: string
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
