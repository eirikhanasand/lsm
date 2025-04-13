import fetchRepoConfig from "@/utils/fetchRepoConfig"

type RepoConfigPageProps = { 
    params: Promise<{ repo: string }> 
}

type SectionProps = {
    list: string
    items: RepoListItem[]
}

export default async function RepoConfigPage({ params }: RepoConfigPageProps) {
    const repo = (await params).repo
    const { whitelist, blacklist } = await fetchRepoConfig(repo)

    return (
        <main className="min-h-full w-full p-4">
            <h1 className="text-3xl font-bold mb-4">Repository Config: {repo}</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Section list='white' items={whitelist} />
                <Section list='black' items={blacklist} />
            </div>
        </main>
    )
}

function Section({list, items}: SectionProps) {
    const local = items.filter(item => !item.isGlobal)
    const global = items.filter(item => item.isGlobal)

    return (
        <section>
            <h2 className="text-2xl font-semibold mb-2">{list[0].toUpperCase()}{list.slice(1)}list</h2>

            {/* Repository-Specific list */}
            <h3 className="text-xl font-medium mt-4">Repository-Specific Rules</h3>
            {local.length === 0 ? (
                <p>No local {list}list rules.</p>
            ) : (
                <ul className="list-disc list-inside">
                    {items.map((item: RepoWhitelistItem) => (
                        <li key={item.name}>
                            {item.name}{" "}
                            {item.versions.length > 0 && (
                                <span>(Versions: {item.versions.join(", ")})</span>
                            )}
                        </li>
                    ))}
                </ul>
            )}

            {/* Global list */}
            <h3 className="text-xl font-medium mt-4">Global Rules</h3>
            {global.length === 0 ? (
                <p>No global {list}list rules.</p>
            ) : (
                <ul className="list-disc list-inside">
                    {items.map((item: RepoWhitelistItem) => (
                        <li key={item.name}>
                            {item.name}{" "}
                            {item.versions.length > 0 && (
                                <span>(Versions: {item.versions.join(", ")})</span>
                            )}
                        </li>
                    ))}
                </ul>
            )}
        </section>
    )
}
