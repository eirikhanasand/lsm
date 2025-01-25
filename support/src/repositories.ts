import dotenv from 'dotenv'

dotenv.config()


if (!('TOKEN' in process.env) || !process.env.TOKEN?.length) {
    console.log("Missing token in env.")
}

const token = process.env.TOKEN

const repositories = [
    {
      "key": "wproj-dev-docker-local-1",
      "packageType": "docker",
      "description": "",
      "notes": "",
      "includesPattern": "**/*",
      "excludesPattern": "",
      "rclass": "local"
    },
      {
      "key": "wproj-dev-docker-local-2",
      "packageType": "docker",
      "description": "",
      "notes": "",
      "includesPattern": "**/*",
      "excludesPattern": "",
      "rclass": "local"
    }
]

const id = "trial9apndc"

async function createRepositories() {
    try {
        console.log("Creating repositories...")
        
        const response = await fetch(`https://${id}.jfrog.io/artifactory/api/v2/repositories/batch`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(repositories)
        })

        if (!response.ok) {
            throw new Error(await response.text())
        }

        const data = await response.json()
        console.log("Successfully created repositories...")
        return data
    } catch (error) {
        console.error("Failed to create repositories.")
        console.error(error)
    }
}

createRepositories()