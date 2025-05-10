/**
 * Helper function to group the packages by their ecosystem to display them in
 * groups on the `allow` and `block` list pages.
 * 
 * @param packages Array of packages to render
 * 
 * @returns The packages grouped by ecosystem as a `Record<group, Package[]>` object.
 */
export default function groupPackagesByEcosystem(packages: Package[]) {
    const grouped: Record<string, Package[]> = {}
    packages.forEach(pkg => {
        const ecosystem = Array.isArray(pkg.ecosystems) && pkg.ecosystems.length ? pkg.ecosystems.join(', ') : 'global'
        if (!grouped[ecosystem]) {
            grouped[ecosystem] = []
        }
        grouped[ecosystem].push(pkg)
    })
    return grouped
}
