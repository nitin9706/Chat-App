import { LogOut, Trash2, Loader2 } from "lucide-react";

export default function ChatActions({
  isGroup,
  contactId,
  loading,
  act,
  onLeave,
  onDelete,
}) {
  return (
    <div
      className="
        space-y-2
        pt-2
        border-t
        border-sky-50
      "
    >
      {/* Leave Group */}
      {isGroup && (
        <button
          onClick={() => act("leave", () => onLeave(contactId))}
          disabled={loading === "leave"}
          className="
            w-full
            flex
            items-center
            gap-3
            px-3
            py-2.5
            rounded-xl
            text-amber-500
            hover:bg-amber-50
            transition-colors
            text-sm
            font-medium
            cursor-pointer
          "
        >
          {loading === "leave" ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <LogOut className="size-4" />
          )}
          Leave Group
        </button>
      )}

      {/* Delete Chat */}
      <button
        onClick={() => act("delete", () => onDelete(contactId))}
        disabled={loading === "delete"}
        className="
          w-full
          flex
          items-center
          gap-3
          px-3
          py-2.5
          rounded-xl
          text-red-400
          hover:bg-red-50
          transition-colors
          text-sm
          font-medium
          cursor-pointer
        "
      >
        {loading === "delete" ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <Trash2 className="size-4" />
        )}
        Delete Chat
      </button>
    </div>
  );
}
