import dotenv from 'dotenv'
import { repositories, dependantRepositories, } from '../data/repositories.js'

dotenv.config({ path: '../.env' })

const {
    JFROG_TOKEN,
    JFROG_ID
} = process.env

if (!JFROG_TOKEN || !JFROG_TOKEN.length) {
    throw new Error('Missing JFROG_TOKEN in env.')
}

if (!JFROG_ID || !JFROG_ID.length) {
    throw new Error('Missing JFROG_ID in env.')
}

const createRepositoriesResponse = await createRepositories()

if (createRepositoriesResponse.status === 200) {
    createDependantRepositories()
} else {
    console.log(`Failed to create dependant repositories: ${createRepositoriesResponse.error}`)
}

async function createRepositories() {
    try {
        console.log('Creating repositories...')

        const response = await fetch(`https://${JFROG_ID}.jfrog.io/artifactory/api/v2/repositories/batch`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${JFROG_TOKEN}`
            },
            body: JSON.stringify(repositories)
        })

        if (!response.ok) {
            throw new Error(await response.text())
        }

        const data = await response.text()
        console.log(`Successfully created ${repositories.length} repositories.`)
        return { status: 200, data }
    } catch (error) {
        const parsedError = JSON.parse((error as any).message)
        const errorMessage = parsedError?.errors?.[0]?.message

        if (errorMessage.includes('repository key already exists')) {
            console.error('Repositories already exist.')
            return { status: 409, error: 'Repositories already exist.' }
        } else {
            console.error(error)
            return { status: 500, error }
        }
    }
}

async function createDependantRepositories() {
    try {
        console.log('Creating dependant repositories...')

        const response = await fetch(`https://${JFROG_ID}.jfrog.io/artifactory/api/v2/repositories/batch`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${JFROG_TOKEN}`
            },
            body: JSON.stringify(dependantRepositories)
        })

        if (!response.ok) {
            throw new Error(await response.text())
        }

        const data = await response.text()
        console.log(`Successfully created ${dependantRepositories.length} dependant repositories.`)
        return data
    } catch (error) {
        const parsedError = JSON.parse((error as any).message)
        const errorMessage = parsedError?.errors?.[0]?.message

        if (errorMessage.includes('dependant repository key already exists')) {
            console.error('Dependant repositories already exist.')
        } else {
            console.error(error)
        }
    }
}
