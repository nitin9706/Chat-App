import { useState } from "react";

import ChatInfoHeader from "./ChatInfoHeader";
import ChatProfile from "./ChatProfile";
import GroupMembers from "./GroupMembers";
import AddMember from "./AddMember";
import ChatActions from "./ChatActions";

export default function ChatInfoPanel({
  contact,
  currentUserId,
  onClose,
  onRename,
  onAddMember,
  onRemoveMember,
  onLeave,
  onDelete,
}) {
  const [renaming, setRenaming] = useState(false);
  const [newName, setNewName] = useState(contact.name);
  const [addInput, setAddInput] = useState("");
  const [loading, setLoading] = useState("");

  const act = async (key, fn) => {
    setLoading(key);

    try {
      await fn();
    } catch {
      // errors bubble via hook
    } finally {
      setLoading("");
    }
  };

  const handleRename = () =>
    act("rename", async () => {
      await onRename(contact.id, newName.trim());
      setRenaming(false);
    });

  const handleAddMember = () => {
    if (!addInput.trim()) return;

    act("add", async () => {
      await onAddMember(contact.id, [addInput.trim()]);
      setAddInput("");
    });
  };

  return (
    <aside className="w-72 shrink-0 bg-white border-l border-sky-100 flex flex-col h-full relative md:w-80">
      {/* Header */}
      <ChatInfoHeader isGroup={contact.isGroup} onClose={onClose} />

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto scrollbar-thin p-4 space-y-5">
        {/* Avatar + Name */}
        <ChatProfile
          contact={contact}
          renaming={renaming}
          newName={newName}
          loading={loading}
          setRenaming={setRenaming}
          setNewName={setNewName}
          handleRename={handleRename}
        />

        {/* Members */}
        <GroupMembers
          contact={contact}
          currentUserId={currentUserId}
          loading={loading}
          act={act}
          onRemoveMember={onRemoveMember}
        />

        {/* Add Member */}
        <AddMember
          isGroup={contact.isGroup}
          addInput={addInput}
          setAddInput={setAddInput}
          handleAddMember={handleAddMember}
          loading={loading}
        />

        {/* Actions */}
        <ChatActions
          isGroup={contact.isGroup}
          contactId={contact.id}
          loading={loading}
          act={act}
          onLeave={onLeave}
          onDelete={onDelete}
        />
      </div>
    </aside>
  );
}
