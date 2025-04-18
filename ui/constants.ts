import dotenv from 'dotenv'

dotenv.config({path: '../.env'})

const { 
    JFROG_ID, 
    JFROG_TOKEN, 
    API: ENV_API, 
    SERVER_API: ENV_SERVER_API,
    DEFAULT_RESULTS_PER_PAGE: ENV_DEFAULT_RESULTS_PER_PAGE,
} = process.env

export { JFROG_ID, JFROG_TOKEN }
// export const API = ENV_API || 'http://localhost:8081/api'
export const API = ENV_API || 'http://129.241.150.86:8080/api'
// export const SERVER_API = ENV_SERVER_API || 'http:/localhost:8081/api'
export const SERVER_API = ENV_SERVER_API || 'http://172.17.0.1:8080/api'
export const DEFAULT_RESULTS_PER_PAGE = ENV_DEFAULT_RESULTS_PER_PAGE || 50
export const ECOSYSTEMS = [  
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
