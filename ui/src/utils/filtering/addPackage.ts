import { Dispatch, SetStateAction } from 'react'
import postPackage from './postPackage'
import { getCookie } from '../cookies'

type AddPackageProps = {
    newPackage: AddPackage
    setPackages: Dispatch<SetStateAction<Package[]>>
    setShowForm: Dispatch<SetStateAction<boolean>>
    setNewPackage: Dispatch<SetStateAction<AddPackage>>
    setError: Dispatch<SetStateAction<string>>
    packages: Package[]
    list: 'allow' | 'block'
    author: Author
    token: string
}

/**
 * Inserts a package into the database.
 * 
 * @param newPackage New package to insert into the database
 * @param setPackages Helper function to set the packages currently displayed in
 * the user interface. Used to display the updated package list until the page
 * is refreshed.
 * @param setShowForm Helper function determining whether the form should be 
 * displayed.
 * @param setNewPackage Helper function to reset the input after the package has
 * been added.
 * @param setError Helper function to set the error variable to be displayed to
 * the user if an error occured.
 * @param packages Packages currently displayed in the user interface.
 * @param list Whether the change concerns the `allow` or `block` list.
 * @param token Token used to authenticate the user
 */
export default async function addPackage({
    newPackage,
    setPackages,
    setShowForm,
    setNewPackage,
    setError,
    packages,
    list,
    token
}: AddPackageProps) {
    if (!newPackage.name && !newPackage.comment) {
        setError(`The package you are ${list}listing must have a name and comment.`)
        return
    }

    if (!newPackage.name || !newPackage.comment) {
        setError(`The package you are ${list}listing must have a ${newPackage.name ? 'comment' : 'name'}.`)
        return
    }

    const completePackage = {...newPackage, 
        ecosystems: JSON.stringify(newPackage.ecosystems) === '[""]' ? [] : newPackage.ecosystems,
        repositories: JSON.stringify(newPackage.repositories) === '[""]' ? [] : newPackage.repositories 
    }

    const response = await postPackage({ list, newPackage: completePackage, token })
    if (response.status === 409) {
        setError(response.error!)
        return
    }
    if (response.status === 500) {
        setError(`Failed to add package. API error. ${response.error!}`)
        return
    }

    const name = getCookie('user') || 'Unknown User'
    const id = getCookie('id') || '0'
    const avatar = getCookie('avatar') || 'null'

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
            event: `Added ${name} ${Array.isArray(newPackage.versions) 
                && newPackage.versions.length ? `versions ${
                    newPackage.versions.join(', ')}` : 'for all versions'} ${
                Array.isArray(newPackage.ecosystems) && newPackage.ecosystems
                    .length ? `${Array.isArray(newPackage.versions) && newPackage
                        .versions.length ? 'with' : 'for'} ecosystems ${newPackage
                        .ecosystems.join(', ')}` : 'for all ecosystems'} to the ${list
            }list for ${Array.isArray(newPackage.repositories) && newPackage
                .repositories.length ? newPackage.repositories.join(', ') 
                : 'all repositories'} with comment ${newPackage.comment}${
                Array.isArray(newPackage.references) && newPackage.references
                    .length ? ` and references ${newPackage.references}` : ''}.`,
            author: { id, name, avatar },
            timestamp: new Date().toISOString(),
            id: String(packages.length + 1)
        }]
    }])
    setShowForm(false)
    setNewPackage({
        name: '',
        comment: '',
        versions: [],
        ecosystems: [],
        references: [],
        repositories: [],
        author: { id, name, avatar }
    })
}
