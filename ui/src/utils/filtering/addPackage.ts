import { SetStateAction } from "react"
import postPackage from "./postPackage"

type RemovePackageProps = {
    newPackage: Package
    setPackages: (value: SetStateAction<Package[]>) => void
    setShowForm: (value: SetStateAction<boolean>) => void
    setNewPackage: (value: SetStateAction<Package>) => void
    packages: Package[]
}

export default async function addPackage({newPackage, setPackages, setShowForm, setNewPackage, packages}: RemovePackageProps) {
    if (!newPackage.name || !newPackage.version || !newPackage.ecosystem || !newPackage.comment) {
        alert("Please fill in all fields.")
        return
    }

    const response = await postPackage({list: 'whitelist'})
    
    if (response === 500) {
        alert("Failed to add package. API error.")
        return
    }

    setPackages([...packages, { ...newPackage, id: Date.now() }])
    setShowForm(false)
    setNewPackage({ id: 0, name: "", version: "", ecosystem: "", comment: "" })
}
