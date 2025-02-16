import { SetStateAction } from "react"
import postPackage from "./postPackage"

type AddPackageProps = {
    newPackage: Package
    setPackages: (value: SetStateAction<Package[]>) => void
    setShowForm: (value: SetStateAction<boolean>) => void
    setNewPackage: (value: SetStateAction<Package>) => void
    packages: Package[]
    list: 'whitelist' | 'blacklist'
}

export default async function addPackage({newPackage, setPackages, setShowForm, setNewPackage, packages, list}: AddPackageProps) {
    if (!newPackage.name || !newPackage.version || !newPackage.ecosystem || !newPackage.comment) {
        alert("Please fill in all fields.")
        return
    }

    const response = await postPackage({
        list,
        ecosystem: newPackage.ecosystem,
        version: newPackage.version,
        name: newPackage.name
    })
    
    if (response === 500) {
        alert("Failed to add package. API error.")
        return
    }

    setPackages([...packages, { ...newPackage, id: Date.now() }])
    setShowForm(false)
    setNewPackage({ id: 0, name: "", version: "", ecosystem: "", comment: "" })
}
