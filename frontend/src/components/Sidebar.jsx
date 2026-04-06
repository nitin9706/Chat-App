import {
  MessageSquare,
  Settings,
  Users,
  Bell,
  Plus,
  Loader2,
  LogOut,
  UserPlus,
} from "lucide-react";
import SearchBar from "./SearchBar";
import ContactItem from "./ContactItem";
import Avatar from "./Avatar";

export default function Sidebar({
  chats,
  activeContactId,
  onSelectContact,
  searchQuery,
  onSearchChange,
  loading,
  onNewChat,
  onCreateGroup,
  user,
  onLogout,
  onClose,
}) {
  return (
    <aside className="w-72 shrink-0 bg-white border-r border-sky-100 flex flex-col h-full relative md:w-80">
      {/* Mobile close button */}
      {/* <button
        onClick={onClose}
        className="md:hidden absolute top-4 right-10 size-8 rounded-lg flex items-center justify-center text-sky-400 hover:bg-sky-50 hover:text-sky-600 transition-colors cursor-pointer z-10"
      >
        ✕
      </button> */}
      {/* Header */}
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
      </div>

      {/* Section Label */}
      <div className="px-4 pt-4 pb-1 flex items-center gap-2">
        <Users className="size-3.5 text-sky-400" />
        <span className="text-xs font-semibold text-sky-400 uppercase tracking-widest">
          Messages
        </span>
      </div>

      {/* Chat list */}
      <nav className="flex-1 overflow-y-auto scrollbar-thin px-2 py-1 space-y-0.5">
        {loading ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="size-5 text-sky-300 animate-spin" />
          </div>
        ) : chats.length > 0 ? (
          chats.map((chat) => (
            <ContactItem
              key={chat.id}
              contact={chat}
              isActive={chat.id === activeContactId}
              onClick={onSelectContact}
            />
          ))
        ) : (
          <div className="flex flex-col items-center py-12 gap-3 text-center px-4">
            <div className="size-10 bg-sky-50 rounded-xl flex items-center justify-center">
              <MessageSquare className="size-5 text-sky-300" />
            </div>
            <p className="text-sm text-gray-500 font-medium">No chats yet</p>
            <p className="text-xs text-sky-300 leading-relaxed">
              Press <span className="font-semibold">👤+</span> to start a direct
              message or <span className="font-semibold">+</span> to create a
              group
            </p>
          </div>
        )}
      </nav>

      {/* User Footer */}
      <div className="px-4 py-3 border-t border-sky-100 flex items-center gap-3">
        <Avatar
          initials={(user?.username || user?.fullname || "Y")
            .slice(0, 2)
            .toUpperCase()}
          imageUrl={user?.avatar || ""}
          color="bg-sky-500"
          status="online"
          size="sm"
        />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-800 truncate">
            {user?.username || user?.fullname || "You"}
          </p>
          <p className="text-xs text-sky-400">Active now</p>
        </div>
        <button
          onClick={onLogout}
          className="size-7 rounded-lg flex items-center justify-center text-sky-300 hover:bg-sky-50 hover:text-red-400 transition-colors cursor-pointer"
          title="Sign out"
        >
          <LogOut className="size-3.5" />
        </button>
      </div>
    </aside>
  );
}
