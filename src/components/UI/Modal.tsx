import { useEffect, type ReactNode } from 'react'
import { X } from 'lucide-react'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  children: ReactNode
  title?: string
}

export function Modal({ isOpen, onClose, children, title }: ModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  return (
    <>
      <div
        className={`bottom-sheet-overlay ${isOpen ? 'open' : ''}`}
        onClick={onClose}
      />
      <div className={`bottom-sheet ${isOpen ? 'open' : ''} max-h-[90vh] overflow-y-auto`}>
        <div className="flex items-center justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-border" />
        </div>
        {title && (
          <div className="flex items-center justify-between px-5 py-3 border-b border-border">
            <h2 className="font-semibold text-base text-slate-100">{title}</h2>
            <button
              onClick={onClose}
              className="p-1.5 text-muted hover:text-slate-200 transition-colors"
              aria-label="Fermer"
            >
              <X size={18} />
            </button>
          </div>
        )}
        <div className="pb-8">{children}</div>
      </div>
    </>
  )
}
