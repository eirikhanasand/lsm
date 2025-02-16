type Package = {
    name: string
    version: string
    ecosystem: string
    repository: string | null
    comment: string
}

type Cookie = {
    name: string
    value: string
}

type ClientPageProps = {
    packages: Package[]
}
