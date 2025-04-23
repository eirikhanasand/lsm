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
