"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { MarkdownRenderer } from "@/components/markdown-renderer";
import { ChatHistorySidebar } from "@/components/chat-history-sidebar";
import { HugeiconsIcon } from "@hugeicons/react";
import { 
  ArrowRight01Icon,
  Robot02Icon,
  BookIcon,
  Add01Icon,
  GlobeIcon,
  FileScriptIcon,
  AlertCircle,
  AlertIcon,
  File02Icon,
  Download01Icon,
  Loading02Icon,
} from "@hugeicons/core-free-icons";
import { nanoid } from "nanoid";

// Message types for different AI responses
type MessageType = 
  | "normal"           // Regular chat message
  | "error"            // Error message
  | "pdf"              // PDF attachment only
  | "normal-with-pdf"  // Message with PDF attachment
  | "loading";         // Loading state (e.g., generating PDF)

type PDFAttachment = {
  name: string;
  size: number;        // In bytes
  createdAt: Date;
  downloadUrl: string;
};

type Message = {
  id: string;          // Unique ID for each message to update later
  role: "user" | "assistant";
  content: string;
  type: MessageType;
  pdfAttachment?: PDFAttachment;
};

// Helper function to format file size
function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

export default function SpeakPage() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [currentThreadId, setCurrentThreadId] = useState<string | null>(null);
  const { data: session, isPending } = authClient.useSession();

  // Initialize with a new thread on mount
  useEffect(() => {
    if (!currentThreadId) {
      setCurrentThreadId(nanoid());
    }
  }, [currentThreadId]);

  // Check message count for current thread
  const { data: threadData, refetch: refetchThreadData } = useQuery({
    queryKey: ["thread", currentThreadId],
    queryFn: async () => {
      if (!currentThreadId) return null;
      const response = await fetch(`/api/threads/${currentThreadId}`);
      if (!response.ok) return null;
      return response.json() as Promise<{ messageCount: number; isLimitReached: boolean }>;
    },
    enabled: !!currentThreadId,
    refetchInterval: false,
  });

  const isLimitReached = threadData?.isLimitReached || false;
  const messageCount = threadData?.messageCount || 0;

  // Helper function to update a message by ID
  const updateMessage = (id: string, updates: Partial<Message>) => {
    setMessages((prev) => 
      prev.map((msg) => 
        msg.id === id ? { ...msg, ...updates } : msg
      )
    );
  };

  const chatMutation = useMutation({
    mutationFn: async (userMessage: string) => {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: userMessage,
          userName: session?.user?.name || "User",
          userEmail: session?.user?.email || "",
          threadId: currentThreadId,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to send message");
      }

      if (!response.body) {
        throw new Error("No response body");
      }

      return response.body;
    },
    onMutate: () => {
      setIsStreaming(true);
      // Add empty assistant message that will be filled with streamed content
      const messageId = `msg-${Date.now()}`;
      setMessages((prev) => [
        ...prev,
        { 
          id: messageId,
          role: "assistant", 
          content: "",
          type: "normal",
        },
      ]);
      return { messageId };
    },
    onSuccess: async (stream, _variables, context) => {
      const messageId = context?.messageId;
      const reader = stream.getReader();
      const decoder = new TextDecoder();
      let accumulatedText = "";

      try {
        while (true) {
          const { done, value } = await reader.read();
          
          if (done) {
            setIsStreaming(false);
            
            // Check if response contains PDF metadata
            const pdfMatch = accumulatedText.match(/\n\n(\{\"__PDF_ATTACHMENT__\":true,.+\})$/);
            if (pdfMatch) {
              try {
                const pdfData = JSON.parse(pdfMatch[1]);
                const textContent = accumulatedText.replace(pdfMatch[0], "").trim();
                
                setMessages((prev) => 
                  prev.map((msg) => 
                    msg.id === messageId 
                      ? { 
                          ...msg, 
                          content: textContent,
                          type: "normal-with-pdf" as MessageType,
                          pdfAttachment: {
                            name: pdfData.fileName,
                            size: pdfData.fileSize,
                            createdAt: new Date(pdfData.createdAt),
                            downloadUrl: pdfData.downloadUrl,
                          }
                        }
                      : msg
                  )
                );
              } catch (e) {
                console.error("[Chat] Failed to parse PDF metadata:", e);
              }
            }
            
            // Refetch thread data to update message count
            refetchThreadData();
            break;
          }

          const chunk = decoder.decode(value, { stream: true });
          accumulatedText += chunk;

          // Update the message with accumulated text (excluding PDF metadata if present)
          const displayText = accumulatedText.replace(/\n\n\{\"__PDF_ATTACHMENT__\":true,.+\}$/, "");
          setMessages((prev) => 
            prev.map((msg) => 
              msg.id === messageId 
                ? { ...msg, content: displayText }
                : msg
            )
          );
        }

        // Check if the response is an error message
        if (accumulatedText === "We couldn't process your message") {
          setMessages((prev) => 
            prev.map((msg) => 
              msg.id === messageId 
                ? { ...msg, type: "error" as MessageType }
                : msg
            )
          );
        }
      } catch (error) {
        console.error("[Chat] Streaming error:", error);
        setMessages((prev) => 
          prev.map((msg) => 
            msg.id === messageId 
              ? { ...msg, content: "We couldn't process your message", type: "error" as MessageType }
              : msg
          )
        );
        setIsStreaming(false);
      }
    },
    onError: (error, _variables, context) => {
      console.error("[Chat] Mutation error:", error);
      const messageId = context?.messageId;
      setMessages((prev) => 
        prev.map((msg) => 
          msg.id === messageId 
            ? { ...msg, content: "We couldn't process your message", type: "error" as MessageType }
            : msg
        )
      );
      setIsStreaming(false);
    },
  });

  const handleSendMessage = () => {
    if (!message.trim()) return;

    // Add user message to chat
    setMessages((prev) => [
      ...prev, 
      { 
        id: `msg-${Date.now()}`,
        role: "user", 
        content: message,
        type: "normal",
      }
    ]);
    
    // Send to API
    chatMutation.mutate(message);
    
    // Clear input
    setMessage("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const quickActions = [
    {
      text: "Help me with my homework",
      icon: BookIcon,
      bgColor: "bg-green-500 hover:bg-green-600 text-white",
    },
    {
      text: "Generate a new project",
      icon: Add01Icon,
      bgColor: "bg-blue-500 hover:bg-blue-600 text-white",
    },
    {
      text: "I need help with my Social Studies project",
      icon: GlobeIcon,
      bgColor: "bg-orange-500 hover:bg-orange-600 text-white",
    },
    {
      text: "Generate an English report for me",
      icon: FileScriptIcon,
      bgColor: "bg-purple-500 hover:bg-purple-600 text-white",
    },
  ];

  const handleQuickAction = (text: string) => {
    setMessage((prev) => (prev ? prev + " " + text : text));
  };

  const handleThreadSelect = (threadId: string) => {
    setCurrentThreadId(threadId);
    setMessages([]); // Clear current messages (will load from DB if needed)
  };

  const handleNewChat = () => {
    setCurrentThreadId(nanoid());
    setMessages([]);
  };

  const showQuickActions = messages.length === 0;

  return (
    <>
      {/* Chat History Sidebar */}
      <ChatHistorySidebar
        currentThreadId={currentThreadId}
        onThreadSelect={handleThreadSelect}
        onNewChat={handleNewChat}
      />

      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container flex h-16 items-center justify-between px-4">
            <div className="flex items-center gap-2">
              <HugeiconsIcon icon={Robot02Icon} size={28} className="text-brand" />
              <h1 className="text-xl font-semibold text-brand">Tatenda</h1>
            </div>
            <Button variant="ghost" size="sm">
              <Link href="/dashboard">Back to dashboard</Link>
            </Button>
          </div>
        </header>

        {/* Main Content */}
        <div className="container max-w-4xl mx-auto px-4 py-8">
          {/* Only show greeting when no messages */}
          {messages.length === 0 && (
            <>
              <div className="mb-6">
                {isPending ? (
                  <div className="space-y-2">
                    <Skeleton className="h-9 w-48" />
                    <Skeleton className="h-9 w-32" />
                  </div>
                ) : (
                  <h2 className="text-3xl font-semibold text-foreground w-fit p-4 rounded-xl bg-purple-200">
                    Hello, {session?.user?.name || "User"}
                  </h2>
                )}
              </div>
              <div className="mb-8">
                <h3 className="text-3xl font-semibold text-muted-foreground">
                  How can I help you today?
                </h3>
                {showQuickActions && (
                  <div className="mt-6 grid md:grid-cols-2 md:grid-row-2 gap-2">
                    {quickActions.map((action, index) => (
                      <Button
                        key={index}
                        onClick={() => handleQuickAction(action.text)}
                        className={`${action.bgColor} flex items-center gap-2 py-6 rounded-full`}
                      >
                        <p className="text-md font-semibold">{action.text}</p>
                        <HugeiconsIcon icon={action.icon} size={16} />
                      </Button>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}

          {/* Messages Display */}
          {messages.length > 0 && (
            <div className="space-y-4 mb-20">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  {/* Error Message */}
                  {msg.type === "error" && (
                    <div className="max-w-[80%] p-4 border border-red-300 text-red-500 rounded-lg flex items-start gap-3">
                      <HugeiconsIcon icon={AlertIcon} size={20} className="flex-shrink-0 mt-0.5" />
                      <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                    </div>
                  )}

                  {/* Loading Message */}
                  {msg.type === "loading" && (
                    <Card className="max-w-[80%] p-4 bg-muted border-brand/30">
                      <div className="flex items-center gap-3">
                        <HugeiconsIcon 
                          icon={Loading02Icon} 
                          size={20} 
                          className="text-brand animate-spin" 
                        />
                        <div className="space-y-2">
                          <p className="text-sm text-muted-foreground">
                            {msg.content || "Processing your request..."}
                          </p>
                          <div className="flex gap-1">
                            <div className="w-2 h-2 bg-brand rounded-full animate-bounce" />
                            <div className="w-2 h-2 bg-brand rounded-full animate-bounce" style={{ animationDelay: "0.1s" }} />
                            <div className="w-2 h-2 bg-brand rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
                          </div>
                        </div>
                      </div>
                    </Card>
                  )}

                  {/* PDF Attachment Only */}
                  {msg.type === "pdf" && msg.pdfAttachment && (
                    <Card className="max-w-[80%] overflow-hidden border-2 border-brand/20 bg-gradient-to-br from-brand/5 to-purple-50 shadow-lg hover:shadow-xl transition-shadow">
                      {/* Header with gradient */}
                      <div className="bg-gradient-to-r from-brand to-purple-600 p-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-white/20 backdrop-blur-sm rounded-lg">
                            <HugeiconsIcon icon={File02Icon} size={24} className="text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-white text-sm">
                              Document Ready
                            </p>
                            <p className="text-white/80 text-xs">
                              Your PDF has been generated successfully
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-4 space-y-3">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-foreground text-sm truncate">
                              {msg.pdfAttachment.name}
                            </p>
                            <div className="flex items-center gap-2 mt-1.5">
                              <span className="px-2 py-0.5 bg-brand/10 text-brand rounded-full text-xs font-medium">
                                PDF
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {formatFileSize(msg.pdfAttachment.size)}
                              </span>
                              <span className="text-xs text-muted-foreground">•</span>
                              <span className="text-xs text-muted-foreground">
                                {new Date(msg.pdfAttachment.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Download Button */}
                        <Button
                          className="w-full bg-brand hover:bg-brand/90 text-white shadow-md hover:shadow-lg transition-all"
                          onClick={() => {
                            const link = document.createElement('a');
                            link.href = msg.pdfAttachment!.downloadUrl;
                            link.download = msg.pdfAttachment!.name;
                            document.body.appendChild(link);
                            link.click();
                            document.body.removeChild(link);
                          }}
                        >
                          <HugeiconsIcon icon={Download01Icon} size={18} />
                          Download PDF
                        </Button>
                      </div>
                    </Card>
                  )}

                  {/* Normal Message with PDF Attachment */}
                  {msg.type === "normal-with-pdf" && (
                    <div className="max-w-[80%] space-y-3">
                      {/* AI Message */}
                      <Card className="p-4 bg-muted">
                        <MarkdownRenderer content={msg.content} />
                      </Card>
                      
                      {/* Beautiful PDF Card */}
                      {msg.pdfAttachment && (
                        <Card className="overflow-hidden border-2 border-brand/20 bg-gradient-to-br from-brand/5 to-purple-50 shadow-lg hover:shadow-xl transition-shadow">
                          {/* Header with gradient */}
                          <div className="bg-gradient-to-r from-brand to-purple-600 p-4">
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-white/20 backdrop-blur-sm rounded-lg">
                                <HugeiconsIcon icon={File02Icon} size={24} className="text-white" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-semibold text-white text-sm">
                                  Document Ready
                                </p>
                                <p className="text-white/80 text-xs">
                                  Your PDF has been generated successfully
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Content */}
                          <div className="p-4 space-y-3">
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-foreground text-sm truncate">
                                  {msg.pdfAttachment.name}
                                </p>
                                <div className="flex items-center gap-2 mt-1.5">
                                  <span className="px-2 py-0.5 bg-brand/10 text-brand rounded-full text-xs font-medium">
                                    PDF
                                  </span>
                                  <span className="text-xs text-muted-foreground">
                                    {formatFileSize(msg.pdfAttachment.size)}
                                  </span>
                                  <span className="text-xs text-muted-foreground">•</span>
                                  <span className="text-xs text-muted-foreground">
                                    {new Date(msg.pdfAttachment.createdAt).toLocaleDateString()}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Download Button */}
                            <Button
                              className="w-full bg-brand hover:bg-brand/90 text-white shadow-md hover:shadow-lg transition-all"
                              onClick={() => {
                                const link = document.createElement('a');
                                link.href = msg.pdfAttachment!.downloadUrl;
                                link.download = msg.pdfAttachment!.name;
                                document.body.appendChild(link);
                                link.click();
                                document.body.removeChild(link);
                              }}
                            >
                              <HugeiconsIcon icon={Download01Icon} size={18} />
                              Download PDF
                            </Button>
                          </div>
                        </Card>
                      )}
                    </div>
                  )}

                  {/* Normal Message */}
                  {msg.type === "normal" && (
                    <Card
                      className={`max-w-[80%] p-4 ${
                        msg.role === "user"
                          ? "bg-brand text-white"
                          : "bg-muted"
                      }`}
                    >
                      {msg.role === "user" ? (
                        <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                      ) : (
                        <>
                          <MarkdownRenderer 
                            content={msg.content} 
                            isStreaming={isStreaming && messages[messages.length - 1]?.id === msg.id}
                          />
                          {!msg.content && isStreaming && messages[messages.length - 1]?.id === msg.id && (
                            <span className="inline-block w-2 h-4 bg-muted-foreground animate-pulse" />
                          )}
                        </>
                      )}
                    </Card>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Memory placeholder for Mastra agent */}
          {showQuickActions && (
            <Card className="mb-20 p-6 border border-yellow-300">
              <div className="text-muted-foreground text-sm">
                <article className="flex flex-row gap-1 mb-1 items-center">
                  <HugeiconsIcon icon={AlertCircle} color="oklch(79.5% 0.184 86.047)" />
                  <p className="font-semibold text-muted-foreground text-yellow-500">Memory active</p>
                </article> This chat will remember your previous setMessages
              </div>
            </Card>
          )}

        {/* Input Section - Fixed at bottom */}
        <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-t">
          <div className="container max-w-4xl mx-auto px-4 py-4">
            {isLimitReached ? (
              // Message limit reached UI
              <Card className="p-4 border-brand/30 bg-brand/5">
                <div className="flex items-center gap-3">
                  <HugeiconsIcon icon={AlertCircle} size={20} className="text-brand" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">
                      Maximum chat size reached
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Please start a new chat to continue
                    </p>
                  </div>
                  <Button
                    onClick={handleNewChat}
                    className="bg-brand hover:bg-brand/90"
                  >
                    New Chat
                  </Button>
                </div>
              </Card>
            ) : (
              // Normal input UI
              <div className="relative">
                <Input
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your message..."
                  className="pr-12 h-12 rounded-full border-2 focus-visible:ring-brand"
                  disabled={isStreaming}
                />
                <Button
                  size="icon"
                  onClick={handleSendMessage}
                  disabled={!message.trim() || isStreaming}
                  className="absolute right-1 top-1/2 -translate-y-1/2 rounded-full w-10 h-10 bg-brand hover:bg-brand/90 disabled:opacity-50"
                >
                  <HugeiconsIcon icon={ArrowRight01Icon} size={20} />
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
    </>
  );
}
