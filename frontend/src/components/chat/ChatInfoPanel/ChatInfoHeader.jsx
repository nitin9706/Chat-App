import { X } from "lucide-react";

export default function ChatInfoHeader({ isGroup, onClose }) {
  return (
    <>
      {/* Mobile close button */}
      <button
        onClick={onClose}
        className="
          md:hidden
          absolute
          top-4
          left-4
          size-8
          rounded-lg
          flex
          items-center
          justify-center
          text-sky-400
          hover:bg-sky-50
          hover:text-sky-600
          transition-colors
          cursor-pointer
          z-10
        "
      >
        <X className="size-4" />
      </button>

      {/* Header */}
      <div
        className="
          px-4
          py-4
          border-b
          border-sky-50
          flex
          items-center
          justify-between
          md:justify-center
        "
      >
        <span
          className="text-sm font-semibold text-gray-900 md:ml-8"
          style={{
            fontFamily: "var(--font-display)",
          }}
        >
          {isGroup ? "Group Info" : "Contact Info"}
        </span>

        {/* Desktop close button */}
        <button
          onClick={onClose}
          className="
            hidden
            md:flex
            size-7
            rounded-lg
            items-center
            justify-center
            text-sky-400
            hover:bg-sky-50
            hover:text-sky-600
            transition-colors
            cursor-pointer
          "
        >
          <X className="size-4" />
        </button>
      </div>
    </>
  );
}
