type DropdownProps = {
    className?: string
    item: string
    items: string[]
    allItems: string[]
    setItems: (value: string[]) => void
}

/**
 * Displays a dropdown menu. Used for the dropdown menus in the add and edit 
 * package components.
 * 
 * @param className Custom Tailwind styles to add to the dropdown menu
 * @param item Title of the dropdown menu
 * @param items Currently selected items in the dropdown menu
 * @param allItems All items available in the dropdown menu
 * @param setItems Helper function to set the selected items 
 * @returns 
 */
export default function Dropdown({
    className,
    item,
    items,
    allItems,
    setItems
}: DropdownProps) {
    const current = items.length
        ? JSON.stringify(items) === '[""]' ? `All ${item}` : items.join(', ')
        : `Select ${item}`

    function handleAdd(e: React.ChangeEvent<HTMLSelectElement>) {
        if (e.target.value === '') {
            setItems([''])
        } else {
            setItems(Array.from(e.target.selectedOptions, (option) => option.value))
        }
    }


    return (
        <div className={`relative group inline-block w-full ${className}`}>
            <div className={`${items.length ? 'text-foreground' : 'text-shallow'} p-2 border border-dark rounded-lg text-sm bg-light w-full cursor-pointer select-none p-3 flex items-center`}>
                {current}
            </div>

            <div className='absolute left-0 top-full hidden group-hover:block bg-light border border-dark rounded-lg z-10'>
                <select
                    multiple={true}
                    value={items}
                    onChange={handleAdd}
                    className='p-1 text-sm text-foreground rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 h-40'
                >
                    <option value="">All {item}</option>
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
