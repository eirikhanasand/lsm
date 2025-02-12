import path from "path"
import { fileURLToPath } from "url"
import fs from 'fs/promises'
import { FastifyReply, FastifyRequest } from "fastify"
import versionAffected from "../../utils/version.js"

type OSVData = {
    packages: Map<string, string[]>
    vulnerabilties: Map<string, object[]>
}

type Params = {
    name: string
    version: string
    ecosystem: string
    type?: string
}

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const startTime = new Date().getTime()
const osv = await getOSV() as OSVData
export default async function osvHandlerOld(req: FastifyRequest, res: FastifyReply) {
    const { name, version, ecosystem } = req.params as Params

    if (!name || !version || !ecosystem) {
        return {
            error: "Missing name, version or ecosystem.",
            message: "Error occured."
        }
    }

    if (!osv.packages.has(name)) {
        return {}
    }

    const data = []
    const vulnerable = osv.packages.get(name)
    if (!Array.isArray(vulnerable)) {
        return res.status(500).send({
            error: `Package ${name} is marked as vulnerable, but no vulnerabilties occurred.`,
            message: "Error occured."
        })
    }

    for (const pkg of vulnerable) {
        const vulnerability = osv.vulnerabilties.get(pkg)
        if (versionAffected(version, ecosystem, vulnerability)) {
            data.push(vulnerability)
        }
    }

    return data.length ? data : {}
}

async function getOSV() {
    const vulnerabilties = new Map()
    const packages = new Map()
    console.log("Started reading OSV")

    try {
        const osvFolderPath = path.resolve(__dirname, '../../../osv')
        const files = await fs.readdir(osvFolderPath)

        console.log(`There are ${files.length} files.`)
        for (let i = 0; i < files.length; i++) {
            const file = files[i]
            const heapUsed = (process.memoryUsage().rss / 1024 / 1024).toFixed(0)
            // const heapTotal = (process.availableMemory() / 1024 / 1024).toFixed(0)
            if (i > 0 && i % 1000 === 0) { console.log(`RAM: ${heapUsed}/24000 MB\tRead ${i} files.`) }
            const filePath = path.resolve(osvFolderPath, file)
            const fileContent = await fs.readFile(filePath, 'utf-8')
            const analysisData = JSON.parse(fileContent)
            vulnerabilties.set(analysisData.id, analysisData)
            
            if (!Array.isArray(analysisData.affected)) {
                continue
            }

            for (const affectedPackage of analysisData.affected) {
                if ('package' in affectedPackage && 'name' in affectedPackage.package) {
                    const name = affectedPackage.package.name
                    packages.set(name, [
                        ...(packages.get(name) || []),
                        analysisData.id
                    ])
                }
            }
        }

        console.log("Vulnerable packages", packages.size)
        console.log("Discovered vulnerabilities", vulnerabilties.size)
        console.log(`Sample vulnerable package: "${(packages.entries().next().value || [])[0]}"`)
        const now = new Date().getTime()
        console.log("Elapsed", now - startTime, "ms")
        return { packages, vulnerabilties }
    } catch (error) {
        console.error(error)
        return { error }
    }
}
