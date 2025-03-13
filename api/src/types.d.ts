type OSVHandlerParams = {
    name: string
    version: string
    ecosystem: string | undefined
    repository: string | undefined
    comment: string
    reference: string | undefined
    author: Author
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
    version: string
    ecosystem: string
    comment: string
    repository: string
    reference: string
    author: User
}
