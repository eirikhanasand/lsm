import { ReadonlyURLSearchParams, useRouter } from 'next/navigation'
import { Dispatch, RefObject, SetStateAction, useEffect, useRef, useState } from 'react'

type PagingProps = {
    page: number
    pages: number
    setPage: Dispatch<SetStateAction<number>>
    resultsPerPage: number
    search: string
    fetchFunction: () => void
    setResultsPerPage: Dispatch<SetStateAction<number>>
    searchParams: ReadonlyURLSearchParams
    customStyle?: string
}

type InputButtonsProps = {
    setPage: Dispatch<SetStateAction<number>>
    page: number
    lastPage: number
    buttonStyle: string
    activeButtonStyle: string
    unClickableButtonStyle: string
    containerRef: RefObject<null>
}

export default function Paging({
    page,
    pages,
    setPage,
    resultsPerPage,
    search,
    fetchFunction,
    setResultsPerPage,
    searchParams,
    customStyle
}: PagingProps) {
    const unClickableButtonStyle = 'bg-light rounded-md p-1 px-3 hover:bg-extralight h-[2rem] min-w-[2rem] w-fit'
    const buttonStyle = 'bg-light rounded-md p-1 px-3 hover:bg-extralight grid place-items-center cursor-pointer'
    const activeButtonStyle = 'bg-blue-600 hover:bg-blue-500 rounded-md p-1 px-3 grid place-items-center h-[2rem] text-white'
    const containerRef = useRef(null)
    const router = useRouter()

    useEffect(() => {
        const params = new URLSearchParams(searchParams)
        params.set('page', page <= pages ? String(page) : '1')
        params.set('search', search)
        router.replace(`?${params}`)
    }, [page, search])

    useEffect(() => {
        fetchFunction()
    }, [page, resultsPerPage, search])

    return (
        <div className='h-full select-none min-w-fit grid gap-2'>
            <InputButtons
                setPage={setPage}
                page={page}
                lastPage={pages}
                buttonStyle={buttonStyle}
                activeButtonStyle={activeButtonStyle}
                unClickableButtonStyle={unClickableButtonStyle}
                containerRef={containerRef}
            />
            <div className={`flex min-w-fit justify-end items-center max-h-fit ${customStyle}`}>
                <div
                    className='flex justify-between min-w-fit gap-2 mb-2'
                >
                    <h1 className={`${unClickableButtonStyle} min-w-fit flex items-end`}>
                        Page {page} / {pages}
                    </h1>
                    <div className='flex gap-2 min-w-fit cursor-pointer'>
                        <h1
                            onClick={() => setResultsPerPage(25)}
                            className={resultsPerPage === 25 ? activeButtonStyle : buttonStyle}
                        >
                            25
                        </h1>
                        <h1
                            onClick={() => setResultsPerPage(50)}
                            className={resultsPerPage === 50 ? activeButtonStyle : buttonStyle}
                        >
                            50
                        </h1>
                        {
                            pages * resultsPerPage >= 100
                                ? <h1
                                    onClick={() => setResultsPerPage(100)}
                                    className={resultsPerPage === 100 ? activeButtonStyle : buttonStyle}
                                >100</h1> : <></>}
                    </div>
                </div>
            </div>
        </div>
    )
}


function InputButtons({
    page,
    setPage,
    lastPage,
    buttonStyle,
    activeButtonStyle,
    unClickableButtonStyle,
    containerRef,
}: InputButtonsProps) {
    const [customPage, setCustomPage] = useState(page)
    const [displayCustom, setDisplayCustom] = useState(false)
    const twoBack = page - 2
    const previous = page - 1
    const next = page + 1
    const twoForward = page + 2

    useEffect(() => {
        setCustomPage(page)
    }, [page])

    return (
        <div ref={containerRef} className='flex justify-between gap-2 min-w-full'>
            {previous >= 1
                ? <h1 onClick={() => setPage(previous)} className={buttonStyle}>{'<'}</h1>
                : <h1 className={unClickableButtonStyle} />
            }
            {twoBack > 1
                ? <h1 onClick={() => setPage(twoBack)} className={buttonStyle}>{twoBack}</h1>
                : <h1 className={unClickableButtonStyle} />
            }
            {previous >= 1
                ? <h1 onClick={() => setPage(previous)} className={buttonStyle}>{previous}</h1>
                : <h1 className={unClickableButtonStyle} />
            }
            <h1 className={activeButtonStyle}>{page}</h1>
            {lastPage > 1 ? <div
                onMouseEnter={() => { setDisplayCustom(true) }}
                onMouseLeave={() => setDisplayCustom(false)}
            >
                {displayCustom ? <input
                    type='number'
                    min={1}
                    max={lastPage}
                    className={buttonStyle}
                    placeholder='...'
                    value={customPage}
                    onChange={(event) => { 
                        setCustomPage(Number(event.target.value)); 
                        setPage(Number(event.target.value)) 
                    }}
                /> : <h1 className={buttonStyle}>...</h1>}
            </div> : <></>}
            {next < lastPage
                ? <h1 onClick={() => setPage(next)} className={buttonStyle}>{next}</h1>
                : <h1 className={unClickableButtonStyle} />
            }
            {lastPage > twoForward
                ? <h1 className={buttonStyle}>{lastPage}</h1>
                : <h1 className={unClickableButtonStyle} />
            }
            {next <= lastPage
                ? <h1 onClick={() => setPage(next)} className={buttonStyle}>{'>'}</h1>
                : <h1 className={unClickableButtonStyle} />
            }
        </div>
    )
}
