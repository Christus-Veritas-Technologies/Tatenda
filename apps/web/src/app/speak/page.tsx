"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { MarkdownRenderer } from "@/components/markdown-renderer";
import { ChatHistorySidebar } from "@/components/chat-history-sidebar";
import { InlineTemplateSelector, type TemplateOption } from "@/components/template-selector";
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
  Notebook01Icon,
} from "@hugeicons/core-free-icons";
import { nanoid } from "nanoid";
import { motion, AnimatePresence } from "framer-motion";

// Generate unique message ID
const generateMessageId = () => `msg-${nanoid(12)}`;

// Message types for different AI responses
type MessageType = 
  | "normal"              // Regular chat message
  | "error"               // Error message
  | "pdf"                 // PDF attachment only
  | "normal-with-pdf"     // Message with PDF attachment
  | "project"             // Project attachment only
  | "normal-with-project" // Message with project attachment
  | "templates"           // Template picker only
  | "normal-with-templates" // Message with template picker
  | "loading";            // Loading state

type PDFAttachment = {
  name: string;
  size: string;
  url: string;
};

type ProjectAttachment = {
  id: string;
  name: string;
  size: string;
  url: string;
  title: string;
  subject: string;
};

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string | null;
  type: MessageType;
  pdf?: PDFAttachment;
  project?: ProjectAttachment;
  templates?: TemplateOption[];
};

// Helper function to format file size
function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

// API response type
interface ChatResponse {
  messageType: "normal" | "pdf" | "normal-with-pdf" | "project" | "normal-with-project" | "templates" | "normal-with-templates";
  text: string | null;
  pdf: {
    url: string;
    name: string;
    size: string;
  } | null;
  project: {
    id: string;
    url: string;
    name: string;
    size: string;
    title: string;
    subject: string;
  } | null;
  templates: TemplateOption[] | null;
}

export default function SpeakPage() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
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

  // Track the current loading message ID to prevent duplicates
  const loadingMessageIdRef = useRef<string | null>(null);

  const chatMutation = useMutation({
    mutationFn: async (userMessage: string): Promise<ChatResponse> => {
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

      return response.json();
    },
    onMutate: () => {
      setIsLoading(true);
      
      // Generate unique ID and store in ref to prevent duplication from React Strict Mode
      const messageId = generateMessageId();
      
      // Only add loading message if we don't already have one pending
      if (!loadingMessageIdRef.current) {
        loadingMessageIdRef.current = messageId;
        setMessages((prev) => [
          ...prev,
          { 
            id: messageId,
            role: "assistant" as const, 
            content: null,
            type: "loading" as MessageType,
          },
        ]);
      }
      
      return { messageId: loadingMessageIdRef.current };
    },
    onSuccess: (data: ChatResponse, _variables, context) => {
      const messageId = context?.messageId;
      
      if (!messageId) {
        console.error("[Chat] No message ID in context");
        setIsLoading(false);
        return;
      }
      
      // Update the loading message with the actual response
      setMessages((prev) => 
        prev.map((msg) => 
          msg.id === messageId 
            ? { 
                ...msg, 
                role: "assistant" as const, // Ensure role is correct
                content: data.text,
                type: data.messageType,
                pdf: data.pdf ? {
                  name: data.pdf.name,
                  size: data.pdf.size,
                  url: data.pdf.url,
                } : undefined,
                project: data.project ? {
                  id: data.project.id,
                  name: data.project.name,
                  size: data.project.size,
                  url: data.project.url,
                  title: data.project.title,
                  subject: data.project.subject,
                } : undefined,
                templates: data.templates || undefined,
              }
            : msg
        )
      );

      // Clear the loading ref
      loadingMessageIdRef.current = null;
      setIsLoading(false);
      refetchThreadData();
    },
    onError: (error, _variables, context) => {
      console.error("[Chat] Mutation error:", error);
      const messageId = context?.messageId;
      
      if (messageId) {
        setMessages((prev) => 
          prev.map((msg) => 
            msg.id === messageId 
              ? { ...msg, role: "assistant" as const, content: "We couldn't process your message", type: "error" as MessageType }
              : msg
          )
        );
      }
      
      // Clear the loading ref
      loadingMessageIdRef.current = null;
      setIsLoading(false);
    },
  });

  const handleSendMessage = useCallback(() => {
    if (!message.trim() || isLoading) return;

    const userMessage = message.trim();
    
    // Add user message to chat with unique ID
    setMessages((prev) => [
      ...prev, 
      { 
        id: generateMessageId(),
        role: "user" as const, 
        content: userMessage,
        type: "normal" as MessageType,
      }
    ]);
    
    // Clear input immediately
    setMessage("");
    
    // Send to API
    chatMutation.mutate(userMessage);
  }, [message, isLoading, chatMutation]);

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

  // Handle template selection - immediately sends message to Tatenda
  const handleTemplateSelect = useCallback((template: TemplateOption) => {
    if (isLoading) return;
    
    const selectionMessage = `I want the "${template.name}" template`;
    
    // Add user message to chat
    setMessages((prev) => [
      ...prev, 
      { 
        id: generateMessageId(),
        role: "user" as const, 
        content: selectionMessage,
        type: "normal" as MessageType,
      }
    ]);
    
    // Send to API
    chatMutation.mutate(selectionMessage);
  }, [isLoading, chatMutation]);

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
            <div className="space-y-6 mb-20">
              {messages.map((msg) => {
                // Get user initials for avatar fallback
                const userInitials = session?.user?.name
                  ?.split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()
                  .slice(0, 2) || "U";

                // Render message content based on type
                const renderMessageContent = () => {
                  if (msg.role === "user") {
                    return (
                      <Card className="p-4 bg-brand text-white rounded-2xl rounded-tr-sm">
                        <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                      </Card>
                    );
                  }

                  // Assistant messages - switch on type
                  switch (msg.type) {
                    case "error":
                      return (
                        <div className="p-4 border border-red-300 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 rounded-2xl rounded-tl-sm flex items-start gap-3">
                          <HugeiconsIcon icon={AlertIcon} size={20} className="flex-shrink-0 mt-0.5" />
                          <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                        </div>
                      );

                    case "loading":
                      return (
                        <Card className="p-4 bg-muted border-brand/30 rounded-2xl rounded-tl-sm">
                          <div className="flex items-center gap-3">
                            <HugeiconsIcon 
                              icon={Loading02Icon} 
                              size={20} 
                              className="text-brand animate-spin" 
                            />
                            <div className="space-y-2">
                              <p className="text-sm text-muted-foreground">
                                Processing your request...
                              </p>
                              <div className="flex gap-1">
                                <div className="w-2 h-2 bg-brand rounded-full animate-bounce" />
                                <div className="w-2 h-2 bg-brand rounded-full animate-bounce" style={{ animationDelay: "0.1s" }} />
                                <div className="w-2 h-2 bg-brand rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
                              </div>
                            </div>
                          </div>
                        </Card>
                      );

                    case "pdf":
                      return msg.pdf ? <PDFCard pdf={msg.pdf} /> : null;

                    case "normal-with-pdf":
                      return (
                        <div className="space-y-3">
                          {msg.content && (
                            <Card className="p-4 bg-muted rounded-2xl rounded-tl-sm">
                              <MarkdownRenderer content={msg.content} />
                            </Card>
                          )}
                          {msg.pdf && <PDFCard pdf={msg.pdf} />}
                        </div>
                      );

                    case "project":
                      return msg.project ? <ProjectCard project={msg.project} /> : null;

                    case "normal-with-project":
                      return (
                        <div className="space-y-3">
                          {msg.content && (
                            <Card className="p-4 bg-muted rounded-2xl rounded-tl-sm">
                              <MarkdownRenderer content={msg.content} />
                            </Card>
                          )}
                          {msg.project && <ProjectCard project={msg.project} />}
                        </div>
                      );

                    case "templates":
                      return msg.templates ? (
                        <InlineTemplateSelector 
                          templates={msg.templates} 
                          onSelect={handleTemplateSelect}
                        />
                      ) : null;

                    case "normal-with-templates":
                      return (
                        <div className="space-y-3">
                          {msg.content && (
                            <Card className="p-4 bg-muted rounded-2xl rounded-tl-sm">
                              <MarkdownRenderer content={msg.content} />
                            </Card>
                          )}
                          {msg.templates && (
                            <InlineTemplateSelector 
                              templates={msg.templates} 
                              onSelect={handleTemplateSelect}
                            />
                          )}
                        </div>
                      );

                    case "normal":
                    default:
                      return (
                        <Card className="p-4 bg-muted rounded-2xl rounded-tl-sm">
                          {msg.content ? (
                            <MarkdownRenderer content={msg.content} />
                          ) : (
                            <span className="inline-block w-2 h-4 bg-muted-foreground animate-pulse" />
                          )}
                        </Card>
                      );
                  }
                };

                return (
                  <div
                    key={msg.id}
                    className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
                  >
                    {/* Avatar */}
                    {msg.role === "user" ? (
                      <Avatar className="h-9 w-9 flex-shrink-0">
                        <AvatarFallback className="bg-brand/20 text-brand text-xs font-medium">
                          {userInitials}
                        </AvatarFallback>
                      </Avatar>
                    ) : (
                      <div className="h-9 w-9 flex-shrink-0 rounded-full bg-brand flex items-center justify-center">
                        <HugeiconsIcon icon={Robot02Icon} size={20} className="text-white" />
                      </div>
                    )}

                    {/* Message with name */}
                    <div className={`flex flex-col gap-1 max-w-[75%] ${msg.role === "user" ? "items-end" : "items-start"}`}>
                      <span className="text-xs font-medium text-muted-foreground px-1">
                        {msg.role === "user" ? session?.user?.name || "You" : "Tatenda"}
                      </span>
                      {renderMessageContent()}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Memory placeholder for Mastra agent */}
          {showQuickActions && (
            <Card className="mb-20 p-6 border border-yellow-300">
              <div className="text-muted-foreground text-sm">
                <article className="flex flex-row gap-1 mb-1 items-center">
                  <HugeiconsIcon icon={AlertCircle} color="oklch(79.5% 0.184 86.047)" />
                  <p className="font-semibold text-muted-foreground text-yellow-500">Memory active</p>
                </article> This chat will remember your previous messages
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
                  disabled={isLoading}
                />
                <Button
                  size="icon"
                  onClick={handleSendMessage}
                  disabled={!message.trim() || isLoading}
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

// PDF Card Component
function PDFCard({ pdf }: { pdf: PDFAttachment }) {
  return (
    <Card className="overflow-hidden border border-brand/30 bg-gradient-to-br from-brand/5 via-purple-50/50 to-background dark:from-brand/10 dark:via-purple-950/20 dark:to-background shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl">
      {/* Compact header */}
      <div className="bg-gradient-to-r from-brand via-purple-600 to-brand p-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-white/20 backdrop-blur-sm rounded-lg">
            <HugeiconsIcon icon={File02Icon} size={18} className="text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-white text-xs">
              PDF Generated
            </p>
          </div>
          <span className="px-2 py-0.5 bg-white/20 backdrop-blur-sm text-white rounded-full text-[10px] font-medium">
            {pdf.size}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-3 space-y-2.5">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-red-100 dark:bg-red-950/30 rounded">
            <HugeiconsIcon icon={File02Icon} size={16} className="text-red-600 dark:text-red-400" />
          </div>
          <p className="font-medium text-foreground text-sm truncate flex-1">
            {pdf.name}
          </p>
        </div>

        {/* Download Button */}
        <Button
          className="w-full bg-brand hover:bg-brand/90 text-white shadow-md hover:shadow-lg transition-all h-9 text-sm gap-2"
          onClick={() => {
            const link = document.createElement('a');
            link.href = pdf.url;
            link.download = pdf.name;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
          }}
        >
          <HugeiconsIcon icon={Download01Icon} size={16} />
          Download
        </Button>
      </div>
    </Card>
  );
}

// Project Card Component - More prominent for full ZIMSEC projects
function ProjectCard({ project }: { project: ProjectAttachment }) {
  return (
    <Card className="overflow-hidden border-2 border-emerald-500/40 bg-gradient-to-br from-emerald-50 via-teal-50/50 to-background dark:from-emerald-950/30 dark:via-teal-950/20 dark:to-background shadow-xl hover:shadow-2xl transition-all duration-300 rounded-2xl">
      {/* Header with gradient */}
      <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600 p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white/20 backdrop-blur-sm rounded-xl">
            <HugeiconsIcon icon={Notebook01Icon} size={24} className="text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-white text-sm">
              🎉 ZIMSEC Project Generated!
            </p>
            <p className="text-white/80 text-xs">
              Complete SBP with all 6 stages
            </p>
          </div>
          <span className="px-2.5 py-1 bg-white/20 backdrop-blur-sm text-white rounded-full text-xs font-medium">
            {project.size}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Project Title */}
        <div>
          <p className="font-semibold text-foreground text-base line-clamp-2">
            {project.title}
          </p>
          <div className="flex items-center gap-2 mt-1.5">
            <span className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 rounded-full text-xs font-medium">
              {project.subject}
            </span>
            <span className="text-xs text-muted-foreground">
              45 marks structure
            </span>
          </div>
        </div>

        {/* Stage indicators */}
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5, 6].map((stage) => (
            <div
              key={stage}
              className="flex-1 h-1.5 rounded-full bg-emerald-500/80"
              title={`Stage ${stage}`}
            />
          ))}
        </div>

        {/* File info */}
        <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-lg">
          <div className="p-1.5 bg-red-100 dark:bg-red-950/30 rounded">
            <HugeiconsIcon icon={File02Icon} size={14} className="text-red-600 dark:text-red-400" />
          </div>
          <p className="font-medium text-foreground text-xs truncate flex-1">
            {project.name}
          </p>
        </div>

        {/* Download Button */}
        <Button
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white shadow-md hover:shadow-lg transition-all h-10 text-sm gap-2 font-medium"
          onClick={() => {
            const link = document.createElement('a');
            link.href = project.url;
            link.download = project.name;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
          }}
        >
          <HugeiconsIcon icon={Download01Icon} size={18} />
          Download Project
        </Button>
      </div>
    </Card>
  );
}
