import fetchRepoConfig, { RepoWhitelistItem, RepoBlacklistItem } from "@/utils/fetchRepoConfig"
  
export default async function RepoConfigPage({ params }: { params: Promise<{ repo: string }> }) {
    const repo = (await params).repo
    const { whitelist, blacklist } = await fetchRepoConfig(repo)

    const localWhitelist = whitelist.filter(item => !item.isGlobal)
    const globalWhitelist = whitelist.filter(item => item.isGlobal)

    return (
        <main className="min-h-full w-full p-4">
            <h1 className="text-3xl font-bold mb-4">Repository Config: {repo}</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Whitelist Section */}
                <section>
                    <h2 className="text-2xl font-semibold mb-2">Whitelist</h2>

                    {/* Repository-Specific Whitelist */}
                    <h3 className="text-xl font-medium mt-4">Repository-Specific Rules</h3>
                    {localWhitelist.length === 0 ? (
                        <p>No local whitelist rules.</p>
                    ) : (
                        <ul className="list-disc list-inside">
                            {localWhitelist.map((item: RepoWhitelistItem) => (
                                <li key={item.name}>
                                    {item.name}{" "}
                                    {item.versions.length > 0 && (
                                        <span>(Versions: {item.versions.join(", ")})</span>
                                    )}
                                </li>
                            ))}
                        </ul>
                    )}

                    {/* Global Whitelist */}
                    <h3 className="text-xl font-medium mt-4">Global Rules</h3>
                    {globalWhitelist.length === 0 ? (
                        <p>No global whitelist rules.</p>
                    ) : (
                        <ul className="list-disc list-inside">
                            {globalWhitelist.map((item: RepoWhitelistItem) => (
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

                {/* Blacklist Section */}
                <section>
                    <h2 className="text-2xl font-semibold mb-2">Blacklist</h2>

                    {/* Display Blacklist as Before */}
                    {blacklist.length === 0 ? (
                        <p>No blacklisted items.</p>
                    ) : (
                        <ul className="list-disc list-inside">
                            {blacklist.map((item: RepoBlacklistItem) => (
                                <li key={item.name}>{item.name}</li>
                            ))}
                        </ul>
                    )}
                </section>
            </div>
        </main>
    )
}
