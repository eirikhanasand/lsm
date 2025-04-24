import Link from 'next/link'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export default async function Home() {
    const Cookies = await cookies()
    const token = Cookies.get('token')?.value
    const noAuth = process.env.NEXT_PUBLIC_DISABLE_AUTH === 'true'
    const login = noAuth ? '/dashboard' : `${process.env.NEXT_PUBLIC_API}/oauth2/login`
    if (token) {
        redirect('/dashboard')
    }

    return (
        <main className='h-full grid place-items-center p-4'>
            <div>
                <h1 className='text-2xl font-bold text-blue-600 text-center'>Library Safety Manager</h1>
                <p className='mt-2 text-foreground text-center'>
                    A plugin for JFrog Artifactory to check for vulnerabilities in packages.
                </p>
                {noAuth && <p className='mt-2 text-foreground text-center text-red-500'>
                    Auth disabled by environment variable NEXT_PUBLIC_DISABLE_AUTH
                </p>}
                <Link href={login} className='grid place-items-center'>
                    <button className='mt-2 rounded-lg bg-blue-500 px-6 py-2 text-white hover:bg-blue-600 mb-2 cursor-pointer'>
                        Login
                    </button>
                </Link>
            </div>
        </main>
    )
}
