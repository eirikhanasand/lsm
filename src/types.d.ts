type GoogleStatus = {
    status: number
    data: {
        vulns: Vulnerability[]
    }
}

type Vulnerability = {
    id: string
    summary: string
    details: string
    aliases: string[]
    modified: string
    published: string
    database_specific: { 
        "malicious-packages-origins": Package[] 
    }
    references: Reference[]
    affected: Affected[]
    schema_version: string
    credits: Credit[]
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
    versions: string[]
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
