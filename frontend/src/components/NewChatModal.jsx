import { useState } from 'react'
import { Loader2, MessageSquarePlus } from 'lucide-react'
import Modal from './Modal'

export default function NewChatModal({ onClose, onCreate }) {
  const [username, setUsername] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleStart = async () => {
    const val = username.trim().toLowerCase()
    if (!val) { setError('Please enter a username'); return }
    setLoading(true)
    setError('')
    try {
      await onCreate(val)
      onClose()
    } catch (err) {
      setError(err.message || 'Could not start chat')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal title="New Direct Message" onClose={onClose} size="sm">
      <div className="space-y-4">
        <p className="text-xs text-sky-400 leading-relaxed">
          Enter the username of the person you want to chat with.
        </p>

        {error && (
          <p className="text-xs text-red-500 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
        )}

        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
            Username
          </label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleStart()}
            placeholder="e.g. john_doe"
            autoFocus
            className="w-full px-3 py-2.5 bg-sky-50 border border-sky-100 rounded-xl text-sm text-gray-700 placeholder:text-sky-300 focus:outline-none focus:ring-2 focus:ring-sky-300 transition-all"
          />
        </div>

        <div className="flex gap-2 pt-1">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 border border-sky-200 text-sky-600 text-sm font-medium rounded-xl hover:bg-sky-50 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleStart}
            disabled={loading || !username.trim()}
            className="flex-1 py-2.5 bg-sky-500 hover:bg-sky-600 disabled:bg-sky-200 text-white text-sm font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
          >
            {loading ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <><MessageSquarePlus className="size-4" /> Start Chat</>
            )}
          </button>
        </div>
      </div>
    </Modal>
  )
}
