export default function versionAffected(version: string, ecosystem: string, vulnerability: any) {
    for (const pkg of vulnerability.affected) {
        if (pkg.package.ecosystem !== ecosystem && ecosystem !== 'GIT') {
            continue
        }

        for (const range of pkg.ranges) {
            if (ecosystem === 'GIT' && ecosystem !== range.type) {
                continue
            }

            for (let i = 0; i < range.events.length; i++) {
                const event = range.events[i]
                const nextEvent = range.events[i + 1]
                if ('introduced' in event) {
                    const start = event.introduced
                    const fixed = 'fixed' in nextEvent ? nextEvent.fixed : null
                    const last_affected = 'last_affected' in nextEvent ? nextEvent.last_affected : null
                    const end = fixed || last_affected || null
                    if (versionIsInRange(version, start, end)) {
                        return true
                    }
                }
            }
        }
    }
    
    return false
}

function versionIsInRange(version: string, rangeStart: string, rangeEnd: string | null = null) {
    function parseVersion(v: string) {
        return v.split(/[^\d]+/).filter(Boolean).map(Number)
    }

    function compareVersions(v1: number[], v2: number[]) {
        for (let i = 0; i < Math.max(v1.length, v2.length); i++) {
            const part1 = v1[i] || 0
            const part2 = v2[i] || 0
            if (part1 > part2) return 1
            if (part1 < part2) return -1
        }
        return 0
    }

    const versionParts = parseVersion(version)
    const rangeStartParts = parseVersion(rangeStart)

    if (!rangeEnd) {
        return compareVersions(versionParts, rangeStartParts) >= 0
    }

    const rangeEndParts = parseVersion(rangeEnd)

    return (
        compareVersions(versionParts, rangeStartParts) >= 0 &&
        compareVersions(versionParts, rangeEndParts) <= 0
    )
}
