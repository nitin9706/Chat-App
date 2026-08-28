import { UserPlus, Loader2 } from "lucide-react";

export default function AddMember({
  isGroup,
  addInput,
  setAddInput,
  handleAddMember,
  loading,
}) {
  if (!isGroup) {
    return null;
  }

  return (
    <div>
      <p
        className="
          text-xs
          font-semibold
          text-sky-400
          uppercase
          tracking-widest
          mb-2
        "
      >
        Add Member
      </p>

      <div className="flex gap-2">
        <input
          value={addInput}
          onChange={(e) => setAddInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAddMember()}
          placeholder="Username"
          className="
            flex-1
            px-3
            py-2
            text-sm
            bg-sky-50
            border
            border-sky-100
            rounded-xl
            placeholder:text-sky-300
            focus:outline-none
            focus:ring-2
            focus:ring-sky-300
          "
        />

        <button
          onClick={handleAddMember}
          disabled={loading === "add"}
          className="
            size-9
            bg-sky-500
            hover:bg-sky-600
            rounded-xl
            flex
            items-center
            justify-center
            text-white
            cursor-pointer
            shrink-0
          "
        >
          {loading === "add" ? (
            <Loader2 className="size-3.5 animate-spin" />
          ) : (
            <UserPlus className="size-3.5" />
          )}
        </button>
      </div>
    </div>
  );
}
