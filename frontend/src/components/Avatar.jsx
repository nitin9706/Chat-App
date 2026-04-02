const statusColors = {
  online: 'bg-emerald-400',
  away: 'bg-amber-400',
  offline: 'bg-gray-300',
  group: 'bg-sky-400',
}

const sizes = {
  sm: 'size-8 text-xs',
  md: 'size-10 text-sm',
  lg: 'size-14 text-base',
}

const dotSizes = {
  sm: 'size-2',
  md: 'size-2.5',
  lg: 'size-3',
}

export default function Avatar({ initials, imageUrl, color = 'bg-sky-400', status, size = 'md' }) {
  return (
    <div className="relative shrink-0">
      {imageUrl ? (
        <img
          src={imageUrl}
          alt={initials}
          className={`${sizes[size]} rounded-full object-cover ring-2 ring-sky-100`}
          onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextSibling.style.display = 'flex' }}
        />
      ) : null}

      {/* Fallback initials — always rendered, hidden when image loads */}
      <div
        className={`${sizes[size]} ${color} rounded-full flex items-center justify-center text-white font-semibold tracking-wide ${imageUrl ? 'hidden' : ''}`}
        style={{ fontFamily: 'var(--font-display)' }}
      >
        {initials}
      </div>

      {status && (
        <span
          className={`absolute bottom-0 right-0 ${dotSizes[size]} ${statusColors[status] || 'bg-gray-300'} rounded-full ring-2 ring-white`}
        />
      )}
    </div>
  )
}
