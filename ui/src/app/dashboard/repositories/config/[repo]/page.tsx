import Link from "next/link"
import fetchRepoConfig, { RepoWhitelistItem, RepoBlacklistItem } from "@/utils/fetchRepoConfig"
  
export default async function RepoConfigPage({params}: {params: Promise<{ repo: string }>}){
    const repo = (await params).repo
    const { whitelist, blacklist } = await fetchRepoConfig(repo)
    return (
        <main className="min-h-full w-full p-4">
            <div className="mb-4">
                <Link href="/dashboard/repositories">
                    <a className="text-blue-500 underline">← Back to Repositories</a>
                </Link>
            </div>
  
            <h1 className="text-3xl font-bold mb-4">Repository Config: {repo}</h1>
  
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <section>
                    <h2 className="text-2xl font-semibold mb-2">Whitelist</h2>
                    {whitelist.length === 0 ? (
                        <p>No whitelisted items.</p>
                    ) : (
                        <ul className="list-disc list-inside">
                            {whitelist.map((item: RepoWhitelistItem) => (
                                <li key={item.name}>
                                    {item.name}{" "}
                                    {item.versions && item.versions.length > 0 && (
                                        <span>(Versions: {item.versions.join(", ")})</span>
                                    )}
                                </li>
                            ))}
                        </ul>
                    )}
                </section>
        
                <section>
                    <h2 className="text-2xl font-semibold mb-2">Blacklist</h2>
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
    );
}
