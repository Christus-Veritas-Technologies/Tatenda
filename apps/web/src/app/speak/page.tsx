"use client";

import { useState } from "react";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { HugeiconsIcon } from "@hugeicons/react";
import { 
  ArrowRight01Icon,
  Robot02Icon,
  BookIcon,
  Add01Icon,
  GlobeIcon,
  FileScriptIcon,
  AlertCircle,
} from "@hugeicons/core-free-icons";

type Message = {
  role: "user" | "assistant";
  content: string;
};

export default function SpeakPage() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const { data: session, isPending } = authClient.useSession();

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
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to send message");
      }

      return response.json();
    },
    onSuccess: (data) => {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.response },
      ]);
    },
  });

  const handleSendMessage = () => {
    if (!message.trim()) return;

    // Add user message to chat
    setMessages((prev) => [...prev, { role: "user", content: message }]);
    
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

  const showQuickActions = messages.length === 0;

  return (

      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container flex h-16 items-center justify-between px-4">
            <div className="flex items-center gap-2">
              <HugeiconsIcon icon={Robot02Icon} size={28} className="text-brand" />
              <h1 className="text-xl font-semibold text-brand">Tatenda</h1>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard">Back to dashboard</Link>
            </Button>
          </div>
        </header>

        {/* Main Content */}
        <div className="container max-w-4xl mx-auto px-4 py-8">
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

          {/* Messages Display */}
          {messages.length > 0 && (
            <div className="space-y-4 mb-20">
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <Card
                    className={`max-w-[80%] p-4 ${
                      msg.role === "user"
                        ? "bg-brand text-white"
                        : "bg-muted"
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                  </Card>
                </div>
              ))}
              
              {chatMutation.isPending && (
                <div className="flex justify-start">
                  <Card className="max-w-[80%] p-4 bg-muted">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" />
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "0.1s" }} />
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
                    </div>
                  </Card>
                </div>
              )}
            </div>
          )}

          {/* Memory placeholder for Mastra agent */}
          {showQuickActions && (
            <Card className="mb-20 p-6 border border-yellow-300">
              <div className="text-muted-foreground text-sm">
                <article className="flex flex-row gap-1 mb-1 items-center">
                  <HugeiconsIcon icon={AlertCircle} color="oklch(79.5% 0.184 86.047)" />
                  <p className="font-semibold text-muted-foreground text-yellow-500">Memory active</p>
                </article> This chat will remember your previous messages and context using Mastra agent memory.
              </div>
            </Card>
          )}

        {/* Input Section - Fixed at bottom */}
        <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-t">
          <div className="container max-w-4xl mx-auto px-4 py-4">
            <div className="relative">
              <Input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                className="pr-12 h-12 rounded-full border-2 focus-visible:ring-brand"
                disabled={chatMutation.isPending}
              />
              <Button
                size="icon"
                onClick={handleSendMessage}
                disabled={!message.trim() || chatMutation.isPending}
                className="absolute right-1 top-1/2 -translate-y-1/2 rounded-full w-10 h-10 bg-brand hover:bg-brand/90 disabled:opacity-50"
              >
                <HugeiconsIcon icon={ArrowRight01Icon} size={20} />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
