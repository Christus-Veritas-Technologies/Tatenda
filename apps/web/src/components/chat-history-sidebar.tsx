import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Add01Icon,
  Menu01Icon,
  Cancel01Icon,
  MessageAdd01Icon,
} from "@hugeicons/core-free-icons";

interface Thread {
  id: string;
  resourceId: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  metadata: Record<string, unknown>;
}

interface ChatHistorySidebarProps {
  currentThreadId: string | null;
  onThreadSelect: (threadId: string) => void;
  onNewChat: () => void;
}

export function ChatHistorySidebar({
  currentThreadId,
  onThreadSelect,
  onNewChat,
}: ChatHistorySidebarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const queryClient = useQueryClient();

  // Fetch threads
  const { data, isLoading } = useQuery({
    queryKey: ["threads"],
    queryFn: async () => {
      const response = await fetch("/api/threads");
      if (!response.ok) throw new Error("Failed to fetch threads");
      return response.json() as Promise<{ threads: Thread[] }>;
    },
  });

  // Create new thread
  const createThreadMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/threads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      if (!response.ok) throw new Error("Failed to create thread");
      return response.json() as Promise<{ thread: Thread }>;
    },
    onSuccess: ({ thread }) => {
      queryClient.invalidateQueries({ queryKey: ["threads"] });
      onThreadSelect(thread.id);
      onNewChat();
    },
  });

  const handleNewChat = () => {
    createThreadMutation.mutate();
  };

  const threads = data?.threads || [];

  return (
    <>
      {/* Toggle Button */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        variant="ghost"
        size="icon"
        className="fixed left-4 top-4 z-40"
      >
        <HugeiconsIcon
          icon={isOpen ? Cancel01Icon : Menu01Icon}
          size={20}
        />
      </Button>

      {/* Sidebar */}
      <div
        className={`fixed left-0 top-0 h-full w-64 bg-background border-r transition-transform duration-300 z-30 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full p-4 pt-20">
          {/* New Chat Button */}
          <Button
            onClick={handleNewChat}
            disabled={createThreadMutation.isPending}
            className="w-full mb-4"
          >
            <HugeiconsIcon icon={Add01Icon} size={16} />
            New Chat
          </Button>

          {/* Thread List */}
          <div className="flex-1 overflow-y-auto space-y-2">
            {isLoading ? (
              <>
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </>
            ) : threads.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <HugeiconsIcon
                  icon={MessageAdd01Icon}
                  size={48}
                  className="text-muted-foreground mb-4"
                />
                <p className="text-sm text-muted-foreground">
                  No recent chats
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Start a new conversation
                </p>
              </div>
            ) : (
              threads.map((thread) => (
                <button
                  key={thread.id}
                  onClick={() => {
                    onThreadSelect(thread.id);
                    setIsOpen(false);
                  }}
                  className={`w-full text-left p-3 rounded-lg transition-colors ${
                    currentThreadId === thread.id
                      ? "bg-brand text-white"
                      : "hover:bg-muted"
                  }`}
                >
                  <p className="text-sm font-medium truncate">
                    {thread.title}
                  </p>
                  <p className="text-xs opacity-70 mt-1">
                    {new Date(thread.createdAt).toLocaleDateString()}
                  </p>
                </button>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-20"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
