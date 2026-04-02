import { useState } from 'react'
import { Loader2, X, UserPlus } from 'lucide-react'
import Modal from './Modal'

export default function CreateGroupModal({ onClose, onCreate }) {
  const [name, setName] = useState('')
  const [userInput, setUserInput] = useState('')
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const addMember = () => {
    const val = userInput.trim()
    if (!val || members.includes(val)) return
    setMembers((prev) => [...prev, val])
    setUserInput('')
  }

  const handleCreate = async () => {
    if (!name.trim()) { setError('Group name is required'); return }
    // Backend needs at least 3 participants total (you + 2 others)
    if (members.length < 2) { setError('Add at least 2 usernames (group needs 3 total)'); return }
    setLoading(true)
    setError('')
    try {
      await onCreate(name.trim(), members)
      onClose()
    } catch (err) {
      setError(err.message || 'Failed to create group')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal title="Create Group Chat" onClose={onClose}>
      <div className="space-y-4">
        {error && (
          <p className="text-xs text-red-500 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
        )}

        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
            Group Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Design Team"
            className="w-full px-3 py-2.5 bg-sky-50 border border-sky-100 rounded-xl text-sm text-gray-700 placeholder:text-sky-300 focus:outline-none focus:ring-2 focus:ring-sky-300 transition-all"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
            Add Members (Usernames) - min 2
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addMember())}
              placeholder="Enter username (e.g. john_doe)"
              className="flex-1 px-3 py-2.5 bg-sky-50 border border-sky-100 rounded-xl text-sm text-gray-700 placeholder:text-sky-300 focus:outline-none focus:ring-2 focus:ring-sky-300 transition-all"
            />
            <button
              onClick={addMember}
              className="size-10 bg-sky-500 hover:bg-sky-600 rounded-xl flex items-center justify-center text-white transition-colors cursor-pointer shrink-0"
            >
              <UserPlus className="size-4" />
            </button>
          </div>

          {members.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {members.map((m) => (
                <span key={m} className="flex items-center gap-1 bg-sky-100 text-sky-700 text-xs px-2.5 py-1 rounded-full font-medium">
                  <span className="max-w-[100px] truncate">{m}</span>
                  <button onClick={() => setMembers((prev) => prev.filter((x) => x !== m))} className="text-sky-400 hover:text-sky-700 cursor-pointer">
                    <X className="size-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="flex gap-2 pt-1">
          <button onClick={onClose} className="flex-1 py-2.5 border border-sky-200 text-sky-600 text-sm font-medium rounded-xl hover:bg-sky-50 transition-colors cursor-pointer">
            Cancel
          </button>
          <button
            onClick={handleCreate}
            disabled={loading}
            className="flex-1 py-2.5 bg-sky-500 hover:bg-sky-600 disabled:bg-sky-200 text-white text-sm font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            {loading ? <Loader2 className="size-4 animate-spin" /> : 'Create Group'}
          </button>
        </div>
      </div>
    </Modal>
  )
}
