import dotenv from 'dotenv'

dotenv.config({path: '../.env'})

const { 
    JFROG_ID, 
    JFROG_TOKEN,
    SERVER_API,
    DEFAULT_RESULTS_PER_PAGE: ENV_DEFAULT_RESULTS_PER_PAGE,
    IMAGE_URL,
    IMAGE_URL_SHORT,
    SELF_URL,
} = process.env

const ECOSYSTEMS = [
    'ansible',
    'alpine',
    'bower',
    'cargo',
    'chef',
    'cocoapods',
    'composer',
    'conan',
    'cran',
    'debian',
    'docker',
    'gems',
    'gitlfs',
    'go',
    'gradle',
    'helm',
    'ivy',
    'maven',
    'npm',
    'nuget',
    'oci',
    'opkg',
    'p2',
    'pub',
    'puppet',
    'pypi',
    'rpm',
    'sbt',
    'swift',
    'terraform',
    'vagrant',
    'yum',
    'generic'
]

const config = {
    JFROG_ID,
    JFROG_TOKEN,
    DEFAULT_RESULTS_PER_PAGE: ENV_DEFAULT_RESULTS_PER_PAGE || 50,
    IMAGE_URL,
    SERVER_API,
    IMAGE_URL_SHORT,
    SELF_URL,
    ECOSYSTEMS
}

export default config
