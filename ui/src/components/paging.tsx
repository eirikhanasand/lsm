import { ReadonlyURLSearchParams, useRouter } from "next/navigation"
import { Dispatch, RefObject, SetStateAction, useEffect, useRef, useState } from "react"

type PagingProps = {
    page: number
    setPage: Dispatch<SetStateAction<number>>
    resultsPerPage: number
    items: unknown[]
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
    setWidth: Dispatch<SetStateAction<number>>
}

export default function Paging({page, setPage, resultsPerPage, items, setResultsPerPage, searchParams, customStyle}: PagingProps) {
    const unClickableButtonStyle = "bg-light rounded-md p-1 px-3 hover:bg-extralight h-[2rem] min-w-[2rem]"
    const buttonStyle = "bg-light rounded-md p-1 px-3 hover:bg-extralight grid place-items-center cursor-pointer"
    const activeButtonStyle = "bg-blue-600 hover:bg-blue-500 rounded-md p-1 px-3 grid place-items-center h-[2rem] text-white"
    const containerRef = useRef(null)
    const [width, setWidth] = useState(0)
    const start = (page - 1) * resultsPerPage + 1
    const end = Math.min(page * resultsPerPage, items.length)
    const lastPage = Math.ceil(items.length / resultsPerPage) || 1
    const router = useRouter()

    useEffect(() => {
        const params = new URLSearchParams(searchParams)
        if (page <= lastPage) {
            params.set('page', String(page))
            router.replace(`?${params.toString()}`)
        } else {
            params.set('page', String(1))
            router.replace(`?${params.toString()}`)
            window.location.reload()
        }
    }, [page])

    return (
        <div className="h-full">
            <InputButtons
                setPage={setPage} 
                page={page} 
                lastPage={lastPage}
                buttonStyle={buttonStyle}
                activeButtonStyle={activeButtonStyle}
                unClickableButtonStyle={unClickableButtonStyle}
                containerRef={containerRef}
                setWidth={setWidth}
            />
            <div className={`flex w-full justify-between items-center max-h-[50px] overflow-hidden py-[0.55rem] ${customStyle}`}>
                <div style={{width}} className="flex justify-between w-[18vw] min-w-[15.35vw]">
                    <h1 className={`${unClickableButtonStyle} min-w-[8rem] ${items.length >= 100 ? "text-sm" : ""} flex items-center`}>
                        Showing {start} - {end} / {items.length}
                    </h1>
                    <div className="flex gap-2">
                        <h1 onClick={() => setResultsPerPage(25)} className={resultsPerPage === 25 ? activeButtonStyle : buttonStyle}>25</h1>
                        <h1 onClick={() => setResultsPerPage(50)} className={resultsPerPage === 50 ? activeButtonStyle : buttonStyle}>50</h1>
                        {items.length >= 100 ? <h1 onClick={() => setResultsPerPage(50)} className={resultsPerPage === 100 ? activeButtonStyle : buttonStyle}>100</h1> : <></>}
                    </div>
                </div>
            </div>
        </div>
    )
}


function InputButtons({page, setPage, lastPage, buttonStyle, activeButtonStyle, unClickableButtonStyle, containerRef, setWidth}: InputButtonsProps) {
    const [customPage, setCustomPage] = useState(page)
    const [displayCustom, setDisplayCustom] = useState(false)
    const twoBack = page - 2
    const previous = page - 1
    const next = page + 1
    const twoForward = page + 2

    useEffect(() => {
        setCustomPage(page)
    }, [page])

    useEffect(() => {
        if (containerRef.current) {
            const resizeObserver = new ResizeObserver((entries) => {
                for (const entry of entries) {
                    setWidth(entry.contentRect.width)
                }
            });
            resizeObserver.observe(containerRef.current)
            return () => resizeObserver.disconnect()
        }
    }, []);

    return (
        <div ref={containerRef} className="flex gap-2">
            {previous >= 1 ? <h1 onClick={() => setPage(previous)} className={buttonStyle}>{"<"}</h1> : <h1 className={unClickableButtonStyle} />}
            {twoBack > 1 ? <h1 onClick={() => setPage(twoBack)} className={buttonStyle}>{twoBack}</h1> : <h1 className={unClickableButtonStyle} />}
            {previous >= 1 ? <h1 onClick={() => setPage(previous)} className={buttonStyle}>{previous}</h1> : <h1 className={unClickableButtonStyle} />}
            <h1 className={activeButtonStyle}>{page}</h1>
            {lastPage > 1 ? <div onMouseEnter={() => {setDisplayCustom(true)}} onMouseLeave={() => setDisplayCustom(false)}>
                {displayCustom ? <input 
                    type="number"
                    min={1}
                    max={lastPage}
                    className={buttonStyle}
                    placeholder="..."
                    value={customPage}
                    onChange={(event) => {setCustomPage(Number(event.target.value)); setPage(Number(event.target.value))}}
                /> : <h1 className={buttonStyle}>...</h1>}
            </div> : <></>}
            {next < lastPage ? <h1 onClick={() => setPage(next)} className={buttonStyle}>{next}</h1> : <h1 className={unClickableButtonStyle} />}
            {lastPage > twoForward ? <h1 className={buttonStyle}>{lastPage}</h1> : <h1 className={unClickableButtonStyle} />}
            {next <= lastPage ? <h1 onClick={() => setPage(next)} className={buttonStyle}>{">"}</h1> : <h1 className={unClickableButtonStyle} />}
        </div>
    )
}
