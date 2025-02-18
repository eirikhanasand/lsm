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

type Cookie = {
    name: string
    value: string
}

type ClientPageProps = {
    list: 'whitelist' | 'blacklist'
    packages: APIPackage[]
}
