import React, { useEffect } from 'react'
import { X } from 'lucide-react'

interface ModalProps {
  open: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  wide?: boolean
}

export function Modal({ open, onClose, title, children, wide }: ModalProps) {
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center md:p-4">
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative bg-white w-full overflow-hidden rounded-t-2xl md:rounded-2xl shadow-2xl shadow-black/10 md:w-full ${wide ? 'md:max-w-2xl' : 'md:max-w-xl'}`}
           style={{ maxHeight: '92dvh', paddingBottom: 'env(safe-area-inset-bottom)' }}>
        {title && (
          <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-stone-100">
            <h2 className="text-base font-semibold text-stone-800">{title}</h2>
            <button onClick={onClose} className="p-1.5 rounded-lg text-stone-400 hover:text-stone-600 hover:bg-stone-100 transition-colors">
              <X size={16} />
            </button>
          </div>
        )}
        <div className="overflow-y-auto max-h-[80vh]">
          {children}
        </div>
      </div>
    </div>
  )
}
