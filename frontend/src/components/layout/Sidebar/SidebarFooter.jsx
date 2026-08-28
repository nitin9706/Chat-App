import { LogOut } from "lucide-react";

import Avatar from "../../common/Avatar";

export default function SidebarFooter({ user, onLogout }) {
  return (
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
  );
}
