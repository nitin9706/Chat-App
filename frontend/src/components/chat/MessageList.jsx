import { useEffect, useRef } from "react";
import { Loader2 } from "lucide-react";
import MessageBubble from "./MessageBubble";

function Skeleton() {
  return (
    <div className="space-y-4 py-4 px-6">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className={`flex ${i % 2 === 0 ? "justify-end" : "justify-start"}`}
        >
          <div className="h-10 w-48 bg-sky-100 rounded-2xl animate-pulse" />
        </div>
      ))}
    </div>
  );
}

export default function MessageList({ messages, loading, onDelete, isGroup }) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (loading)
    return (
      <div className="flex-1 overflow-hidden">
        <Skeleton />
      </div>
    );

  return (
    <div className="flex-1 overflow-y-auto scrollbar-thin px-6 py-4">
      {messages.length === 0 ? (
        <div className="h-full flex flex-col items-center justify-center text-center gap-2">
          <div className="size-12 bg-sky-100 rounded-2xl flex items-center justify-center text-2xl">
            💬
          </div>
          <p className="text-gray-500 text-sm font-medium">No messages yet</p>
          <p className="text-sky-300 text-xs">
            Say hello to start the conversation!
          </p>
        </div>
      ) : (
        <>
          {messages.map((msg, idx) => {
            const prev = messages[idx - 1];
            const isConsecutive = prev && prev.from === msg.from;
            return (
              <MessageBubble
                key={msg.id}
                message={msg}
                isConsecutive={isConsecutive}
                onDelete={onDelete}
                isGroup={isGroup}
              />
            );
          })}
          <div ref={bottomRef} />
        </>
      )}
    </div>
  );
}
