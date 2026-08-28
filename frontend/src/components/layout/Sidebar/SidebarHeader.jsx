import {
  MessageSquare,
  Settings,
  Users,
  Bell,
  Plus,
  UserPlus,
} from "lucide-react";

import SearchBar from "../SearchBar";

export default function SidebarHeader({
  searchQuery,
  onSearchChange,
  onNewChat,
  onCreateGroup,
  onClose,
}) {
  return (
    <div className="px-4 pt-5 pb-4 border-b border-sky-50">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2" onClick={onClose}>
          <div className="size-7 bg-sky-500 rounded-lg flex items-center justify-center">
            <MessageSquare className="size-4 text-white" strokeWidth={2.5} />
          </div>
          <h1
            className="text-lg font-bold text-gray-900 tracking-tight"
            style={{ fontFamily: "var(--font-display)" }}
          >
            ChatApp
          </h1>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={onNewChat}
            className="size-8 rounded-lg flex items-center justify-center text-sky-400 hover:bg-sky-50 hover:text-sky-600 transition-colors cursor-pointer"
            title="New direct message"
          >
            <UserPlus className="size-4" />
          </button>
          <button
            onClick={onCreateGroup}
            className="size-8 rounded-lg flex items-center justify-center text-sky-400 hover:bg-sky-50 hover:text-sky-600 transition-colors cursor-pointer"
            title="New group chat"
          >
            <Plus className="size-4" />
          </button>
          <button className="size-8 rounded-lg flex items-center justify-center text-sky-400 hover:bg-sky-50 hover:text-sky-600 transition-colors cursor-pointer">
            <Bell className="size-4" />
          </button>
          <button className="size-8 rounded-lg flex items-center justify-center text-sky-400 hover:bg-sky-50 hover:text-sky-600 transition-colors cursor-pointer">
            <Settings className="size-4" />
          </button>
        </div>
      </div>

      <SearchBar value={searchQuery} onChange={onSearchChange} />

      <div className="px-0 pt-4 pb-1 flex items-center gap-2">
        <Users className="size-3.5 text-sky-400" />
        <span className="text-xs font-semibold text-sky-400 uppercase tracking-widest">
          Messages
        </span>
      </div>
    </div>
  );
}
