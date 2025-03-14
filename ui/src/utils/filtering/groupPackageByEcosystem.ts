export default function groupPackagesByEcosystem(packages: Package[]) {
    const grouped: Record<string, Package[]> = {}
    packages.forEach(pkg => {
        const ecosystem = Array.isArray(pkg.ecosystems) ? pkg.ecosystems.join(", ") : (pkg.ecosystems || "Other")
        if (!grouped[ecosystem]) {
            grouped[ecosystem] = []
        }
        grouped[ecosystem].push(pkg)
    })
    return grouped
}
