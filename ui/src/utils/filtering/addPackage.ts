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
    if (!newPackage.name || !newPackage.comment) {
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
        versions: newPackage.versions,
        ecosystems: newPackage.ecosystems,
        repositories: newPackage.repositories,
        comment: newPackage.comment,
        references: newPackage.references,
        authors: [{ id, name, avatar }],
        created: { id, name, avatar, time: new Date().toISOString() },
        updated: { id, name, avatar, time: new Date().toISOString() },
        changeLog: [{
            name,
            event: `Added ${name} ${Array.isArray(newPackage.versions) && newPackage.versions.length ? `versions ${newPackage.versions.join(', ')}` : ''} ${Array.isArray(newPackage.ecosystems) && newPackage.ecosystems.length ? `${Array.isArray(newPackage.versions) && newPackage.versions.length ? 'with' : 'for'} ecosystems ${newPackage.ecosystems.join(', ')}` : 'for all ecosystems'} to the ${list} for ${Array.isArray(newPackage.repositories) && newPackage.repositories.length ? newPackage.repositories : 'all repositories'} with comment ${newPackage.comment}${Array.isArray(newPackage.references) && newPackage.references.length ? ` and references ${newPackage.references}` : ''}.`,
            author: { id, name, avatar },
            timestamp: new Date().toISOString(),
            id: String(packages.length + 1)
        }]
    }])
    setShowForm(false)
    setNewPackage({ 
        name: "",
        comment: "",
        versions: [],
        ecosystems: [],
        references: [],
        repositories: [],
        author: { id, name, avatar }
    })
}
