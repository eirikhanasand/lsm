import { SERVER_API } from '@constants'

// Fetches the audit log from lsm API
export default async function getAuditLog() {
    try {
        const response = await fetch(`${SERVER_API}/audit`)

        if (!response.ok) {
            throw new Error(await response.text())
        }

        const data = await response.json()
        return data
    } catch (error) {
        console.error(error)
        return 500
    }
}
