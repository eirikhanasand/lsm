type OSVHandlerParams = {
    name: string
    version: string
    ecosystem: string
    repository: string
    comment: string
    author: string
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
