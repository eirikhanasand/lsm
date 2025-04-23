import config from '@constants'

const { JFROG_ID, JFROG_TOKEN } = config

export default async function fetchRepositories(): Promise<Repository[]> {
    try {
        const response = await fetch(`https://${JFROG_ID}.jfrog.io/artifactory/api/repositories`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${JFROG_TOKEN}`
            },
        })

        if (!response.ok) {
            throw new Error(await response.text())
        }

        const data = response.json()
        return data
    } catch (error) {
        console.error(error)
        return []
    }
}
