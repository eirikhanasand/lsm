type DropdownProps = {
    className?: string
    item: string
    items: string[]
    allItems: string[]
    setItems: (value: string[]) => void
}

export default function Dropdown({
    className,
    item,
    items,
    allItems,
    setItems
}: DropdownProps) {
    return (
        <div className={`relative group inline-block w-full ${className}`}>
            <div className={`${items.length ? 'text-foreground' : 'text-shallow'} h-7 p-1 border border-dark rounded-lg text-sm bg-light w-full cursor-pointer select-none h-[4vh] flex items-center pl-2`}>
                {items.length ? items.join(', ') : `Select ${item}`}
            </div>

            <div className='absolute left-0 top-full hidden group-hover:block bg-light border border-dark rounded-lg z-10'>
                <select
                    multiple={true}
                    value={items}
                    onChange={(e) => setItems(Array.from(e.target.selectedOptions, (option) => option.value))}
                    className='p-1 text-sm text-foreground rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 h-40'
                >
                    <option value=''>All {item}</option>
                    {allItems.map((item) => (
                        <option key={item} value={item}>
                            {item}
                        </option>
                    ))}
                </select>
            </div>
        </div>
    )
}
