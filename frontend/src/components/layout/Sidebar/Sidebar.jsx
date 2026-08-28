import SidebarHeader from "./SidebarHeader";
import ChatList from "./ChatList";
import SidebarFooter from "./SidebarFooter";

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
      <SidebarHeader
        searchQuery={searchQuery}
        onSearchChange={onSearchChange}
        onNewChat={onNewChat}
        onCreateGroup={onCreateGroup}
        onClose={onClose}
      />

      <ChatList
        chats={chats}
        activeContactId={activeContactId}
        onSelectContact={onSelectContact}
        loading={loading}
      />

      <SidebarFooter user={user} onLogout={onLogout} />
    </aside>
  );
}
