import { Dispatch, SetStateAction } from "react"
import postPackage from "./postPackage"
import { getCookie } from "../cookies"

type AddPackageProps = {
    newPackage: AddPackage
    setPackages: Dispatch<SetStateAction<Package[]>>
    setShowForm: Dispatch<SetStateAction<boolean>>
    setNewPackage: Dispatch<SetStateAction<AddPackage>>
    packages: Package[]
    list: 'whitelist' | 'blacklist'
    author: Author
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
    const id = getCookie('id')
    const avatar = getCookie('avatar')
    if (!name || !id || !avatar) {
        alert('You`re not logged in. Redirecting to login.')
        // Should implement redirect back later
        return window.location.href = '/logout' 
    }

    setPackages([...packages, { 
        name: newPackage.name,
        versions: [newPackage.version],
        ecosystems: newPackage.ecosystem !== null ? [newPackage.ecosystem] : [],
        repositories: newPackage.repository !== null ? [newPackage.repository] : [],
        comments: [newPackage.comment],
        references: newPackage.reference !== null ? [newPackage.reference] : [],
        authors: [{ id, name, avatar }],
        created: { id, name, avatar, time: new Date().toISOString() },
        updated: { id, name, avatar, time: new Date().toISOString() },
        changeLog: [{
            name,
            event: `Added ${newPackage.name} version ${newPackage.version} ${newPackage.ecosystem ? `with ecosystem ${newPackage.ecosystem}` : 'for all ecosystems'} to the whitelist for ${newPackage.repository ? newPackage.repository : 'all repositories'} with comment ${newPackage.comment}.`,
            author: { id, name, avatar },
            timestamp: new Date().toISOString(),
            id: "1"
        }]
    }])
    setShowForm(false)
    setNewPackage({ 
        name: "",
        version: "",
        ecosystem: null,
        comment: "",
        reference: null,
        repository: null,
        author: newPackage.author
    })
}
