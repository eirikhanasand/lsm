import Link from "next/link"

type SectionProps = {
    text: string
    href: string
}

export default function Section({text, href}: SectionProps) {
    return (
        <Link href={href}>
            <button className="w-60 rounded-lg bg-blue-500 px-6 py-2 text-sm text-white hover:bg-blue-600">
                {text}
            </button>
        </Link>
    )
}
