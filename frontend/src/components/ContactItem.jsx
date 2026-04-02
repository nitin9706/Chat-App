import Avatar from './Avatar'

export default function ContactItem({ contact, isActive, onClick }) {
  return (
    <button
      onClick={() => onClick(contact.id)}
      className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-150 text-left cursor-pointer ${
        isActive ? 'bg-sky-500 shadow-md shadow-sky-200' : 'hover:bg-sky-50'
      }`}
    >
      <Avatar
        initials={contact.avatar}
        imageUrl={isActive ? '' : (contact.avatarUrl || '')}
        color={isActive ? 'bg-white/20' : contact.avatarColor}
        status={contact.status}
      />

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-0.5">
          <span className={`text-sm font-semibold truncate ${isActive ? 'text-white' : 'text-gray-800'}`}>
            {contact.name}
          </span>
          <span className={`text-xs shrink-0 ml-1 ${isActive ? 'text-sky-100' : 'text-gray-400'}`}>
            {contact.lastTime}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <p className={`text-xs truncate ${isActive ? 'text-sky-100' : 'text-gray-500'}`}>
            {contact.lastMessage}
          </p>
          {contact.unread > 0 && !isActive && (
            <span className="ml-1 shrink-0 bg-sky-500 text-white text-xs font-bold rounded-full size-5 flex items-center justify-center">
              {contact.unread}
            </span>
          )}
        </div>
      </div>
    </button>
  )
}
