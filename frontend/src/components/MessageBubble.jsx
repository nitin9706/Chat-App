import { useState } from 'react'
import { Trash2, Loader2, AlertCircle, Paperclip } from 'lucide-react'
import Avatar from './Avatar'

export default function MessageBubble({ message, isConsecutive, onDelete, isGroup }) {
  const isMe = message.from === 'me'
  const [hovered, setHovered] = useState(false)

  return (
    <div
      className={`flex items-end gap-2 ${isMe ? 'justify-end' : 'justify-start'} ${isConsecutive ? 'mt-0.5' : 'mt-4'}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Sender avatar — group chats only, them side, first in a run */}
      {!isMe && isGroup && (
        <div className="shrink-0 mb-5">
          {!isConsecutive ? (
            <Avatar
              initials={message.senderInitials || '?'}
              imageUrl={message.senderAvatar || ''}
              color="bg-sky-400"
              size="sm"
            />
          ) : (
            <div className="size-8" /> // spacer to keep alignment
          )}
        </div>
      )}

      <div className={`max-w-[65%] flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
        {/* Sender name for group chats */}
        {!isMe && isGroup && !isConsecutive && (
          <span className="text-xs text-sky-500 font-medium mb-1 px-1">{message.senderName}</span>
        )}

        <div className="relative flex items-end gap-1.5">
          {/* Delete button (my messages only, on hover) */}
          {isMe && hovered && !message.pending && !message.failed && onDelete && (
            <button
              onClick={() => onDelete(message.id)}
              className="size-6 rounded-lg bg-red-50 flex items-center justify-center text-red-300 hover:text-red-500 transition-colors cursor-pointer mb-5"
            >
              <Trash2 className="size-3" />
            </button>
          )}

          <div>
            <div
              className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                message.failed
                  ? 'bg-red-50 text-red-400 border border-red-100 rounded-br-sm'
                  : isMe
                  ? 'bg-sky-500 text-white rounded-br-sm shadow-sm shadow-sky-200'
                  : 'bg-white text-gray-800 rounded-bl-sm shadow-sm border border-sky-50'
              } ${message.pending ? 'opacity-60' : ''}`}
            >
              {message.text && <p>{message.text}</p>}

              {/* Attachments */}
              {message.attachments?.length > 0 && (
                <div className={`${message.text ? 'mt-2' : ''} space-y-1`}>
                  {message.attachments.map((att, i) => (
                    <a
                      key={i}
                      href={att.url}
                      target="_blank"
                      rel="noreferrer"
                      className={`flex items-center gap-1.5 text-xs underline-offset-2 hover:underline ${
                        isMe ? 'text-sky-100' : 'text-sky-500'
                      }`}
                    >
                      <Paperclip className="size-3 shrink-0" />
                      {att.name || `Attachment ${i + 1}`}
                    </a>
                  ))}
                </div>
              )}
            </div>

            <div className={`flex items-center gap-1 mt-1 px-1 ${isMe ? 'justify-end' : 'justify-start'}`}>
              <span className="text-xs text-gray-400">{message.time}</span>
              {message.pending && <Loader2 className="size-3 text-sky-300 animate-spin" />}
              {message.failed && <AlertCircle className="size-3 text-red-400" title="Failed to send" />}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
