const repositories = [
    // virtual
    {
        "key": "go-virtual",
        "packageType": "go",
        "includesPattern": "**/*",
        "rclass": "virtual",
        "repoLayoutRef": "go-default"
    },
    {
        "key": "ivy-virtual",
        "packageType": "ivy",
        "includesPattern": "**/*",
        "rclass": "virtual",
        "repoLayoutRef": "ivy-default"
    },
    {
        "key": "maven-virtual-test",
        "packageType": "maven",
        "includesPattern": "**/*",
        "rclass": "virtual",
        "repoLayoutRef": "maven-2-default"
    },
    {
        "key": "sbt",
        "packageType": "sbt",
        "includesPattern": "**/*",
        "rclass": "virtual",
        "repoLayoutRef": "sbt-default"
    },

    // local
    {
        "key": "gradle-local",
        "packageType": "gradle",
        "includesPattern": "**/*",
        "rclass": "local",
        "repoLayoutRef": "maven-2-default"
    },
    
    // remote
    {
        "key": "docker",
        "packageType": "docker",
        "includesPattern": "**/*",
        "rclass": "remote",
        "url": "https://registry-1.docker.io/"
    },
    {
        "key": "alpine",
        "packageType": "alpine",
        "includesPattern": "**/*",
        "rclass": "remote",
        "repoLayoutRef": "simple-default",
        "url": "https://dl-cdn.alpinelinux.org/alpine"
    },
    {
        "key": "cargo-remote",
        "packageType": "cargo",
        "includesPattern": "**/*",
        "rclass": "remote",
        "repoLayoutRef": "cargo-default",
        "url": "https://index.crates.io"
    },
    {
        "key": "conda",
        "packageType": "conda",
        "includesPattern": "**/*",
        "rclass": "remote",
        "repoLayoutRef": "simple-default",
        "url": "https://repo.anaconda.com/pkgs/main"
    },
    {
        "key": "cran",
        "packageType": "cran",
        "includesPattern": "**/*",
        "rclass": "remote",
        "repoLayoutRef": "simple-default",
        "url": "https://cran.r-project.org/"
    },
    {
        "key": "debian",
        "packageType": "debian",
        "includesPattern": "**/*",
        "rclass": "remote",
        "repoLayoutRef": "simple-default",
        "url": "http://archive.ubuntu.com/ubuntu/"
    },
    {
        "key": "go",
        "packageType": "go",
        "includesPattern": "**/*",
        "rclass": "remote",
        "repoLayoutRef": "go-default",
        "remoteRepoLayoutRef": "go-default",
        "url": "https://proxy.golang.org",
        "vcsGitProvider": "ARTIFACTORY",
        "archiveBrowsingEnabled": true
    },
    {
        "key": "gradle",
        "packageType": "gradle",
        "includesPattern": "**/*",
        "rclass": "remote",
        "repoLayoutRef": "maven-2-default",
        "url": "https://repo1.maven.org/maven2/"
    },
    {
        "key": "java",
        "packageType": "maven",
        "includesPattern": "**/*",
        "rclass": "remote",
        "repoLayoutRef": "maven-2-default",
        "url": "https://repo1.maven.org/maven2/"
    },
    {
        "key": "maven",
        "packageType": "maven",
        "includesPattern": "**/*",
        "rclass": "remote",
        "repoLayoutRef": "maven-2-default",
        "url": "https://repo1.maven.org/maven2/"
    },
    {
        "key": "npm",
        "packageType": "npm",
        "includesPattern": "**/*",
        "rclass": "remote",
        "repoLayoutRef": "npm-default",
        "url": "https://registry.npmjs.org"
    },
    {
        "key": "python",
        "packageType": "pypi",
        "includesPattern": "**/*",
        "rclass": "remote",
        "repoLayoutRef": "simple-default",
        "url": "https://files.pythonhosted.org",
        "pyPIRegistryUrl": "https://pypi.org"
    },
    {
        "key": "ruby",
        "packageType": "gems",
        "includesPattern": "**/*",
        "rclass": "remote",
        "repoLayoutRef": "simple-default",
        "url": "https://rubygems.org/",
    },
    {
        "key": "terraform",
        "packageType": "terraform",
        "includesPattern": "**/*",
        "rclass": "remote",
        "repoLayoutRef": "simple-default",
        "url": "https://github.com/",
        "gitRegistryUrl": "https://registry.terraform.io",
        "vcsGitDownloadUrl": "https://releases.hashicorp.com"
    },
    {
        "key": "github",
        "packageType": "github",
        "includesPattern": "**/*",
        "rclass": "remote",
        "repoLayoutRef": "simple-default",
        "url": "https://github.com/",
    },
    {
        "key": "bower",
        "packageType": "bower",
        "includesPattern": "**/*",
        "rclass": "remote",
        "repoLayoutRef": "simple-default",
        "url": "https://github.com/",
        "gitRegistryUrl": "https://registry.bower.io",
    },
    {
        "key": "chef",
        "packageType": "chef",
        "includesPattern": "**/*",
        "rclass": "remote",
        "repoLayoutRef": "simple-default",
        "url": "https://supermarket.chef.io",
    },
]

const dependantRepositories = [
    {
        "key": "maven-virtual",
        "packageType": "maven",
        "includesPattern": "**/*",
        "rclass": "virtual",
        "repositories": ["maven-virtual-test"],
        "repoLayoutRef": "maven-2-default"
    },
    {
        "key": "gradle-virtual",
        "packageType": "gradle",
        "includesPattern": "**/*",
        "rclass": "virtual",
        "repositories": ["maven-virtual-test"],
        "repoLayoutRef": "maven-2-default"
    },
]

export { repositories, dependantRepositories }
