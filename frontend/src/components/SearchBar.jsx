import { Search, X } from 'lucide-react'

export default function SearchBar({ value, onChange }) {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-sky-400" />
      <input
        type="text"
        placeholder="Search conversations..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full pl-9 pr-8 py-2.5 bg-sky-50 border border-sky-100 rounded-xl text-sm text-gray-700 placeholder-sky-300 focus:outline-none focus:ring-2 focus:ring-sky-300 focus:border-transparent transition-all"
      />
      {value && (
        <button
          onClick={() => onChange('')}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-sky-400 hover:text-sky-600 transition-colors cursor-pointer"
        >
          <X className="size-3.5" />
        </button>
      )}
    </div>
  )
}
