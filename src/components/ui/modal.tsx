'use client';

import * as React from "react"
import * as ReactDOM from "react-dom"
import { cn } from "@/lib/utils"

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  children: React.ReactNode
  className?: string
}

const Modal = React.forwardRef<
  HTMLDivElement,
  ModalProps
>(({ isOpen, onClose, children, className }, ref) => {
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
    return () => setMounted(false)
  }, [])

  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      const originalOverflow = document.body.style.overflow
      document.body.style.overflow = 'hidden'

      return () => {
        document.removeEventListener('keydown', handleEscape)
        document.body.style.overflow = originalOverflow
      }
    }
  }, [isOpen, onClose])

  if (!mounted || !isOpen) return null

  return ReactDOM.createPortal(
    <div
      className="fixed inset-0 flex items-center justify-center"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/50" />
      <div
        ref={ref}
        className={cn(
          "relative z-10 w-full max-w-md rounded-lg bg-white p-6 shadow-lg dark:bg-gray-800",
          className
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>,
    document.body
  )
})
Modal.displayName = "Modal"

export { Modal }
