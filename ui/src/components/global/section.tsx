import Link from 'next/link'

type SectionProps = {
    text: string
    href: string
}

/**
 * Button used in the dashboard page of the user interface. Rounded corners,
 * centered white text and a blue background.
 * 
 * @param text Button text
 * @param href Where to redirect the user on click
 * 
 * @returns React component 
 */
export default function Section({ text, href }: SectionProps) {
    return (
        <Link href={href} className='w-60 rounded-lg bg-blue-500 px-6 py-2 text-sm text-white hover:bg-blue-600 cursor-pointer text-center'>
            {text}
        </Link>
    )
}
