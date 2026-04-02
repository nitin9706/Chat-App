import { useEffect } from 'react'
import { X } from 'lucide-react'

export default function Modal({ title, onClose, children, size = 'md' }) {
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [onClose])

  const widths = { sm: 'max-w-sm', md: 'max-w-md', lg: 'max-w-lg' }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm px-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className={`w-full ${widths[size]} bg-white rounded-2xl shadow-2xl shadow-sky-100 border border-sky-100`}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-sky-50">
          <h3
            className="text-sm font-semibold text-gray-900"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            {title}
          </h3>
          <button
            onClick={onClose}
            className="size-7 rounded-lg flex items-center justify-center text-sky-400 hover:bg-sky-50 hover:text-sky-600 transition-colors cursor-pointer"
          >
            <X className="size-4" />
          </button>
        </div>
        <div className="px-5 py-4">{children}</div>
      </div>
    </div>
  )
}
