type PencilProps = { 
    className?: string
    fill: string
}

/**
 * Pencil icon displayed in the user interface
 * 
 * @param className `string` of styles to display using Tailwind.
 * @param fill Custom color for the icon.
 * 
 * @returns React component
 */
export default function Pencil({ className, fill }: PencilProps) {
    return (
        <div className={className}>
            <svg
                xmlns='http://www.w3.org/2000/svg'
                viewBox='0 0 512 512'
                className={fill}
            >
                <g>
                    <g>
                        <path 
                            d='M403.914,0L54.044,349.871L0,512l162.128-54.044L512,108.086L403.914,0z M295.829,151.319l21.617,21.617L110.638,379.745
                            l-21.617-21.617L295.829,151.319z M71.532,455.932l-15.463-15.463l18.015-54.043l51.491,51.491L71.532,455.932z M153.871,422.979
                            l-21.617-21.617l206.809-206.809l21.617,21.617L153.871,422.979z M382.297,194.555l-64.852-64.852l21.617-21.617l64.852,64.852
                            L382.297,194.555z M360.679,86.468l43.234-43.235l64.853,64.853l-43.235,43.234L360.679,86.468z'
                        />
                    </g>
                </g>
            </svg>
        </div>
    )
}
