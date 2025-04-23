import React, { ReactNode } from "react"

interface ModalProps {
    children: ReactNode
    onClose: () => void
}

export default function Modal({ children, onClose }: ModalProps) {
    return (
        <div
            className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
            onClick={onClose}
        >
            <div
                className="bg-background p-4 rounded-lg shadow-md border border-dark"
                onClick={(e) => e.stopPropagation()}
            >
                {children}
            </div>
        </div>
    )
}
