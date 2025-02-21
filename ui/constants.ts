import dotenv from 'dotenv'

dotenv.config({path: '../.env'})

const { 
    JFROG_ID: ENV_JFROG_ID, 
    JFROG_TOKEN: ENV_JFROG_TOKEN,
    API: ENV_API
} = process.env

// Document check to bypass client side check
// if (!ENV_JFROG_ID || !ENV_JFROG_TOKEN || !ENV_API) {
//     throw new Error("Missing JFROG_ID, JFROG_TOKEN or API env variables.")
// }

export const JFROG_ID = ENV_JFROG_ID
export const JFROG_TOKEN = ENV_JFROG_TOKEN
export const API = ENV_API || 'http://172.17.0.1:8080/api'
export const SERVER_API = "http://172.17.0.1:8080/api"
export const ECOSYSTEMS = [  
    "ansible",
    "alpine",
    "bower",
    "cargo",
    "chef",
    "cocoapods",
    "composer",
    "conan",
    "cran",
    "debian",
    "docker",
    "gems",
    "gitlfs",
    "go",
    "gradle",
    "helm",
    "ivy",
    "maven",
    "npm",
    "nuget",
    "oci",
    "opkg",
    "p2",
    "pub",
    "puppet",
    "pypi",
    "rpm",
    "sbt",
    "swift",
    "terraform",
    "vagrant",
    "yum",
    "generic"
]
