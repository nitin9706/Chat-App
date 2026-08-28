import { useEffect } from "react";
import { AlertCircle, X } from "lucide-react";

export default function ErrorToast({ message, onDismiss }) {
  useEffect(() => {
    const timer = setTimeout(onDismiss, 4000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  return (
    <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 bg-white border border-red-100 text-red-500 text-sm px-4 py-3 rounded-2xl shadow-lg shadow-red-50 max-w-sm w-[calc(100%-2rem)]">
      <AlertCircle className="size-4 shrink-0" />
      <span className="flex-1">{message}</span>
      <button
        onClick={onDismiss}
        className="text-red-300 hover:text-red-500 cursor-pointer"
      >
        <X className="size-4" />
      </button>
    </div>
  );
}
