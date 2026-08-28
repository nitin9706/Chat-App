import { Loader2, UserMinus } from "lucide-react";

import Avatar from "../common/Avatar";

export default function GroupMembers({
  contact,
  currentUserId,
  loading,
  act,
  onRemoveMember,
}) {
  if (!contact.isGroup || !contact.members?.length) {
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
        Members
      </p>

      <div className="space-y-1">
        {contact.members.map((member) => {
          const memberKey = `rm_${member._id}`;

          const isCurrentUser =
            member._id?.toString() === currentUserId?.toString();

          return (
            <div
              key={member._id}
              className="
                flex
                items-center
                justify-between
                py-1.5
                px-2
                rounded-lg
                hover:bg-sky-50
              "
            >
              {/* Member information */}
              <div className="flex items-center gap-2 min-w-0">
                <Avatar
                  initials={(member.username || "?").slice(0, 2).toUpperCase()}
                  imageUrl={member.avatar || ""}
                  color="bg-sky-400"
                  size="sm"
                />

                <div className="min-w-0">
                  <p className="text-sm text-gray-700 truncate">
                    {member.username}
                  </p>

                  {member.email && (
                    <p className="text-xs text-sky-400 truncate">
                      {member.email}
                    </p>
                  )}
                </div>
              </div>

              {/* Remove member */}
              {!isCurrentUser && (
                <button
                  onClick={() =>
                    act(memberKey, () => onRemoveMember(contact.id, member._id))
                  }
                  className="
                    text-red-300
                    hover:text-red-500
                    cursor-pointer
                    transition-colors
                    shrink-0
                    ml-2
                  "
                  title="Remove member"
                >
                  {loading === memberKey ? (
                    <Loader2 className="size-3.5 animate-spin" />
                  ) : (
                    <UserMinus className="size-3.5" />
                  )}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
