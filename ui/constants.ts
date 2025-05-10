// Constants used throughout the user interface. Static ones are defined here,
// while dynamic ones are fetched from the environment variables. Those used
// client-side must start with `NEXT_PUBLIC_`.

import dotenv from 'dotenv'

dotenv.config({path: '../.env'})

const {
    SERVER_API,
    DEFAULT_RESULTS_PER_PAGE: ENV_DEFAULT_RESULTS_PER_PAGE,
    IMAGE_URL,
    IMAGE_URL_SHORT,
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
    DEFAULT_RESULTS_PER_PAGE: ENV_DEFAULT_RESULTS_PER_PAGE || 50,
    IMAGE_URL,
    SERVER_API,
    IMAGE_URL_SHORT,
    ECOSYSTEMS
}

export default config
