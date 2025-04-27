import getAuditLog from '@/utils/filtering/getAuditLog'
import Image from 'next/image'
import config from '@parent/constants'
import ProfileIcon from '@/components/svg/profileIcon'

const { IMAGE_URL } = config

type LogProps = {
    log: AuditResult
}

export default async function page() {
    const auditLog: AuditProps = await getAuditLog()
    return (
        <main className='min-h-full w-full flex flex-col p-4'>
            <h1 className='text-3xl font-bold text-blue-600'>Audit log</h1>
            <p className='mt-2 text-foreground mb-2'>{auditLog.results.length ? 'Recent changes.' : 'No recent changes.'}</p>
            <div className='space-y-2'>
                {auditLog.results.reverse().map((log: AuditResult) =>
                    <Log key={log.id} log={log} />
                )}
            </div>
        </main>
    )
}

function Log({ log }: LogProps) {
    const date = new Date(log.timestamp).toLocaleString('en-GB').replaceAll('/', '.')
    const imageExists = IMAGE_URL && log.author.avatar !== 'null'
    return (
        <div className='flex w-full bg-dark rounded-lg px-4 min-h-[40px]'>
            <div className='flex gap-2 w-[15vw]'>
                <div className='relative w-[3.5vh] h-[3.5vh] self-center cursor-pointer rounded-full overflow-hidden'>
                    {imageExists ? <Image
                        src={`${IMAGE_URL}/${log.author.id}/${log.author.avatar}.png?size=64`}
                        alt='Profile Icon'
                        fill={true}
                    /> : <ProfileIcon />}
                </div>
                <h1 className='grid place-items-center text-white'>{log.author.name}</h1>
            </div>
            <h1 className='flex-1 flex items-center text-white'>{log.event}</h1>
            <div className='grid place-items-end'>
                <h1 className='relative mb-auto text-shallow-light text-sm'>{date}</h1>
                <h1 className='relative mt-auto text-shallow-dark text-sm'>{log.id}</h1>
            </div>
        </div>
    )
}
