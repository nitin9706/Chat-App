import { Phone, Video, Info, Menu } from "lucide-react";
import Avatar from "./Avatar";

const statusLabel = {
  online: "Active now",
  away: "Away",
  offline: "Offline",
  group: "Group chat",
};

export default function ChatHeader({ contact, onToggleInfo, onToggleSidebar }) {
  if (!contact) return null;

  return (
    <div className="px-6 py-4 bg-white border-b border-sky-100 flex items-center justify-between shrink-0">
      <div className="flex items-center gap-3">
        {/* Mobile menu button */}
        <button
          onClick={onToggleSidebar}
          className="md:hidden size-9 rounded-xl flex items-center justify-center text-sky-400 hover:bg-sky-50 hover:text-sky-600 transition-colors cursor-pointer mr-2"
        >
          <Menu className="size-4" />
        </button>
        <Avatar
          initials={contact.avatar}
          imageUrl={contact.avatarUrl || ""}
          color={contact.avatarColor}
          status={contact.status}
          size="md"
        />
        <div>
          <h2
            className="text-sm font-semibold text-gray-900"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {contact.name}
          </h2>
          <p className="text-xs text-sky-400">
            {statusLabel[contact.status] || contact.status}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-1">
        <button className="size-9 rounded-xl flex items-center justify-center text-sky-400 hover:bg-sky-50 hover:text-sky-600 transition-colors cursor-pointer">
          <Phone className="size-4" />
        </button>
        <button className="size-9 rounded-xl flex items-center justify-center text-sky-400 hover:bg-sky-50 hover:text-sky-600 transition-colors cursor-pointer">
          <Video className="size-4" />
        </button>
        <button
          onClick={onToggleInfo}
          className="size-9 rounded-xl flex items-center justify-center text-sky-400 hover:bg-sky-50 hover:text-sky-600 transition-colors cursor-pointer"
          title="Chat info"
        >
          <Info className="size-4" />
        </button>
      </div>
    </div>
  );
}
