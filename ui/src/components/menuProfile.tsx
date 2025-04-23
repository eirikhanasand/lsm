'use client'

import { getCookie } from '@/utils/cookies'
import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { DISABLE_TOKEN_CHECK, IMAGE_URL } from '@parent/constants'

export default function MenuProfile({ token }: { token: string | undefined }) {
    const [open, setOpen] = useState(false)
    const [id, setId] = useState<string | null>(null)
    const [avatar, setAvatar] = useState<string | null>(null)

    useEffect(() => {
        const tempId = getCookie('id')
        const tempAvatar = getCookie('avatar')
        if (tempId) setId(tempId)
        if (tempAvatar) setAvatar(tempAvatar)
    }, [])

    if (!token && DISABLE_TOKEN_CHECK !== 'true') {
        return <></>
    }
    if (!id || !avatar) {
        return (
            <div className='self-center'>
                <div className='relative w-[3vh] h-[3vh] self-center cursor-pointer' onClick={() => setOpen((open) => !open)}>
                    <Image src='/profile.svg' alt='logo' fill={true} />
                </div>
                {open && <Content />}
            </div>
        )
    }
    return (
        <div className='self-center'>
            <div className='relative w-[3.5vh] h-[3.5vh] self-center cursor-pointer rounded-full overflow-hidden' onClick={() => setOpen((open) => !open)}>
                <Image src={IMAGE_URL ? `${IMAGE_URL}/${id}/${avatar}.png?size=64` : '/profile.svg'} alt='logo' fill={true} />
            </div>
            {open && <Content />}
        </div>
    )
}

function Content() {
    return (
        <div className='bg-dark absolute h-[4.5vh] w-[15vw] right-2 mt-6 rounded-lg p-2 z-1000'>
            <Link href='/logout' className='flex justify-between items-center'>
                <h1>Log out</h1>
                <div
                    className='relative w-[2.5vh] h-[2.5vh]'
                >
                    <Image src='/logout.svg' alt='logo' fill={true} />
                </div>
            </Link>
        </div>
    )
}