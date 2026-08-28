import { Edit2, Check, Loader2 } from "lucide-react";

import Avatar from "../common/Avatar";

export default function ChatProfile({
  contact,
  renaming,
  newName,
  loading,
  setRenaming,
  setNewName,
  handleRename,
}) {
  return (
    <div className="flex flex-col items-center text-center py-2">
      {/* Avatar */}
      <Avatar
        initials={contact.avatar}
        imageUrl={contact.avatarUrl || ""}
        color={contact.avatarColor}
        status={contact.status}
        size="lg"
      />

      <div className="mt-3 w-full">
        {/* Rename Mode */}
        {renaming ? (
          <div className="flex items-center gap-2">
            <input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleRename()}
              className="
                flex-1
                px-3
                py-1.5
                text-sm
                bg-sky-50
                border
                border-sky-200
                rounded-lg
                focus:outline-none
                focus:ring-2
                focus:ring-sky-300
              "
              autoFocus
            />

            <button
              onClick={handleRename}
              disabled={loading === "rename"}
              className="
                size-7
                bg-sky-500
                rounded-lg
                flex
                items-center
                justify-center
                text-white
                cursor-pointer
              "
            >
              {loading === "rename" ? (
                <Loader2 className="size-3 animate-spin" />
              ) : (
                <Check className="size-3" />
              )}
            </button>
          </div>
        ) : (
          /* Normal Name */
          <div className="flex items-center justify-center gap-2">
            <span className="text-base font-semibold text-gray-900">
              {contact.name}
            </span>

            {contact.isGroup && (
              <button
                onClick={() => {
                  setRenaming(true);
                  setNewName(contact.name);
                }}
                className="
                  text-sky-400
                  hover:text-sky-600
                  cursor-pointer
                "
              >
                <Edit2 className="size-3.5" />
              </button>
            )}
          </div>
        )}

        {/* Status / Members */}
        <p className="text-xs text-sky-400 mt-0.5">
          {contact.isGroup
            ? `${contact.members?.length || 0} members`
            : contact.status}
        </p>
      </div>
    </div>
  );
}
