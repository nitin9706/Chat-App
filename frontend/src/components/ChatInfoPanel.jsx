import { useState } from 'react'
import { X, Edit2, UserPlus, UserMinus, LogOut, Trash2, Check, Loader2 } from 'lucide-react'
import Avatar from './Avatar'

export default function ChatInfoPanel({
  contact,
  currentUserId,
  onClose,
  onRename,
  onAddMember,
  onRemoveMember,
  onLeave,
  onDelete,
}) {
  const [renaming, setRenaming] = useState(false)
  const [newName, setNewName] = useState(contact.name)
  const [addInput, setAddInput] = useState('')
  const [loading, setLoading] = useState('')

  const act = async (key, fn) => {
    setLoading(key)
    try { await fn() } catch { /* errors bubble via hook */ } finally { setLoading('') }
  }

  const handleRename = () =>
    act('rename', async () => {
      await onRename(contact.id, newName.trim())
      setRenaming(false)
    })

  const handleAddMember = () => {
    if (!addInput.trim()) return
    act('add', async () => {
      await onAddMember(contact.id, [addInput.trim()])
      setAddInput('')
    })
  }

  return (
    <aside className="w-72 shrink-0 bg-white border-l border-sky-100 flex flex-col h-full">
      {/* Header */}
      <div className="px-4 py-4 border-b border-sky-50 flex items-center justify-between">
        <span className="text-sm font-semibold text-gray-900" style={{ fontFamily: 'var(--font-display)' }}>
          {contact.isGroup ? 'Group Info' : 'Contact Info'}
        </span>
        <button onClick={onClose} className="size-7 rounded-lg flex items-center justify-center text-sky-400 hover:bg-sky-50 hover:text-sky-600 transition-colors cursor-pointer">
          <X className="size-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin p-4 space-y-5">
        {/* Avatar + name */}
        <div className="flex flex-col items-center text-center py-2">
          <Avatar
            initials={contact.avatar}
            imageUrl={contact.avatarUrl || ''}
            color={contact.avatarColor}
            status={contact.status}
            size="lg"
          />
          <div className="mt-3 w-full">
            {renaming ? (
              <div className="flex items-center gap-2">
                <input
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleRename()}
                  className="flex-1 px-3 py-1.5 text-sm bg-sky-50 border border-sky-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-300"
                  autoFocus
                />
                <button onClick={handleRename} disabled={loading === 'rename'}
                  className="size-7 bg-sky-500 rounded-lg flex items-center justify-center text-white cursor-pointer">
                  {loading === 'rename' ? <Loader2 className="size-3 animate-spin" /> : <Check className="size-3" />}
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2">
                <span className="text-base font-semibold text-gray-900">{contact.name}</span>
                {contact.isGroup && (
                  <button onClick={() => { setRenaming(true); setNewName(contact.name) }}
                    className="text-sky-400 hover:text-sky-600 cursor-pointer">
                    <Edit2 className="size-3.5" />
                  </button>
                )}
              </div>
            )}
            <p className="text-xs text-sky-400 mt-0.5">
              {contact.isGroup ? `${contact.members?.length || 0} members` : contact.status}
            </p>
          </div>
        </div>

        {/* Members list */}
        {contact.isGroup && contact.members?.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-sky-400 uppercase tracking-widest mb-2">Members</p>
            <div className="space-y-1">
              {contact.members.map((m) => (
                <div key={m._id} className="flex items-center justify-between py-1.5 px-2 rounded-lg hover:bg-sky-50">
                  <div className="flex items-center gap-2 min-w-0">
                    <Avatar
                      initials={(m.username || '?').slice(0, 2).toUpperCase()}
                      imageUrl={m.avatar || ''}
                      color="bg-sky-400"
                      size="sm"
                    />
                    <div className="min-w-0">
                      <p className="text-sm text-gray-700 truncate">{m.username}</p>
                      {m.email && <p className="text-xs text-sky-400 truncate">{m.email}</p>}
                    </div>
                  </div>
                  {/* Only admin can remove; don't show button for self */}
                  {m._id?.toString() !== currentUserId?.toString() && (
                    <button
                      onClick={() => act(`rm_${m._id}`, () => onRemoveMember(contact.id, m._id))}
                      className="text-red-300 hover:text-red-500 cursor-pointer transition-colors shrink-0 ml-2"
                      title="Remove member"
                    >
                      {loading === `rm_${m._id}` ? <Loader2 className="size-3.5 animate-spin" /> : <UserMinus className="size-3.5" />}
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Add member */}
        {contact.isGroup && (
          <div>
            <p className="text-xs font-semibold text-sky-400 uppercase tracking-widest mb-2">Add Member</p>
            <div className="flex gap-2">
              <input
                value={addInput}
                onChange={(e) => setAddInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddMember()}
                placeholder="Username"
                className="flex-1 px-3 py-2 text-sm bg-sky-50 border border-sky-100 rounded-xl placeholder:text-sky-300 focus:outline-none focus:ring-2 focus:ring-sky-300"
              />
              <button onClick={handleAddMember} disabled={loading === 'add'}
                className="size-9 bg-sky-500 hover:bg-sky-600 rounded-xl flex items-center justify-center text-white cursor-pointer shrink-0">
                {loading === 'add' ? <Loader2 className="size-3.5 animate-spin" /> : <UserPlus className="size-3.5" />}
              </button>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="space-y-2 pt-2 border-t border-sky-50">
          {contact.isGroup && (
            <button
              onClick={() => act('leave', () => onLeave(contact.id))}
              disabled={loading === 'leave'}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-amber-500 hover:bg-amber-50 transition-colors text-sm font-medium cursor-pointer"
            >
              {loading === 'leave' ? <Loader2 className="size-4 animate-spin" /> : <LogOut className="size-4" />}
              Leave Group
            </button>
          )}
          <button
            onClick={() => act('delete', () => onDelete(contact.id))}
            disabled={loading === 'delete'}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-400 hover:bg-red-50 transition-colors text-sm font-medium cursor-pointer"
          >
            {loading === 'delete' ? <Loader2 className="size-4 animate-spin" /> : <Trash2 className="size-4" />}
            Delete Chat
          </button>
        </div>
      </div>
    </aside>
  )
}
