"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { HugeiconsIcon } from "@hugeicons/react";
import { 
  ArrowRight01Icon,
  Robot02Icon,
  BookIcon,
  Add01Icon,
  GlobeIcon,
  FileScriptIcon,
} from "@hugeicons/core-free-icons";

export default function SpeakPage() {
  const [message, setMessage] = useState("");

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

  return (

      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container flex h-16 items-center px-4">
            <HugeiconsIcon icon={Robot02Icon} size={28} className="text-brand mr-2" />
            <h1 className="text-xl font-semibold text-brand">Tatenda</h1>
          </div>
        </header>

        {/* Main Content */}
        <div className="container max-w-4xl mx-auto px-4 py-8">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-foreground mb-2">
              How can I help you today?
            </h2>
            <div className="flex flex-wrap gap-3 mt-6">
              {quickActions.map((action, index) => (
                <Button
                  key={index}
                  onClick={() => handleQuickAction(action.text)}
                  className={`${action.bgColor} flex items-center gap-2`}
                >
                  {action.text}
                  <HugeiconsIcon icon={action.icon} size={16} />
                </Button>
              ))}
            </div>
          </div>

          {/* Memory placeholder for Mastra agent */}
          <Card className="mb-20 p-6 border border-yellow-300">
            <div className="text-muted-foreground text-sm">
              <article className="inlin-flex gap-2">
                
                </article> This chat will remember your previous messages and context using Mastra agent memory.
            </div>
          </Card>

        {/* Input Section - Fixed at bottom */}
        <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-t">
          <div className="container max-w-4xl mx-auto px-4 py-4">
            <div className="relative">
              <Input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your message..."
                className="pr-12 h-12 rounded-full border-2 focus-visible:ring-brand"
              />
              <Button
                size="icon"
                className="absolute right-1 top-1/2 -translate-y-1/2 rounded-full w-10 h-10 bg-brand hover:bg-brand/90"
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
