import { SetStateAction } from "react"
import postPackage from "./postPackage"
import { getCookie } from "../cookies"

type AddPackageProps = {
    newPackage: AddPackage
    setPackages: (value: SetStateAction<APIPackage[]>) => void
    setShowForm: (value: SetStateAction<boolean>) => void
    setNewPackage: (value: SetStateAction<AddPackage>) => void
    packages: APIPackage[]
    list: 'whitelist' | 'blacklist'
    author: string | null
}

export default async function addPackage({newPackage, setPackages, setShowForm, setNewPackage, packages, list}: AddPackageProps) {
    if (!newPackage.name || !newPackage.version || !newPackage.comment) {
        alert("Please fill in all fields.")
        return
    }

    if (!newPackage.author) {
        alert("Please log in.")
        // Potentially redirect back after logging in and save the state
        return window.location.href = '/logout'
    }

    const response = await postPackage({list, newPackage})
    
    if (response === 500) {
        alert("Failed to add package. API error.")
        return
    }

    const name = getCookie('user')
    const author = getCookie('id')
    const image = getCookie('avatar')
    if (!name || !author || !image) {
        alert('You`re not logged in. Redirecting to login.')
        // Should implement redirect back later
        return window.location.href = '/logout' 
    }

    setPackages([...packages, { 
        name: newPackage.name,
        versions: [newPackage.version],
        ecosystems: [newPackage.ecosystem],
        repositories: newPackage.repository !== null ? [newPackage.repository] : [],
        comments: [newPackage.comment],
        authors: [newPackage.author],
        createdAt: new Date().toISOString(),
        createdBy: newPackage.author,
        updatedAt: new Date().toISOString(),
        updatedBy: newPackage.author,
        changeLog: [{
            name,
            event: `Added ${newPackage.name} version ${newPackage.version} ${newPackage.ecosystem ? `with ecosystem ${newPackage.ecosystem}` : 'for all ecosystems'} to the whitelist for ${newPackage.repository ? newPackage.repository : 'all repositories'} with comment ${newPackage.comment}.`,
            author,
            timestamp: new Date().toISOString(),
            image,
            id: "1"
        }]
    }])
    setShowForm(false)
    setNewPackage({ 
        name: "", 
        version: "", 
        ecosystem: "", 
        comment: "", 
        repository: null, 
        author: newPackage.author
    })
}
