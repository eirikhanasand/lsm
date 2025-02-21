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

type Ecosystem = 
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
