"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { 
  FileTextIcon, 
  PlusSignIcon, 
  ArrowRight01Icon,
  Folder01Icon,
  Calendar03Icon,
  ClockIcon,
} from "@hugeicons/react";

export default function SpeakPage() {
  const [message, setMessage] = useState("");

  // Sample data - will be replaced with real data later
  const recentProjects = [
    { id: 1, title: "Geography Project - Climate Change in Zimbabwe", subject: "Geography" },
    { id: 2, title: "History SBA - Great Zimbabwe Civilization", subject: "History" },
    { id: 3, title: "Biology Practical - Osmosis Experiment", subject: "Biology" },
  ];

  const suggestedTasks = [
    { id: 1, title: "Generate Geography SBA on Climate Change" },
    { id: 2, title: "Create History project on Great Zimbabwe" },
  ];

  const todayTasks = [
    { id: 1, name: "Complete Geography SBA Draft", time: "2 pm", status: "urgent", label: "Due today" },
    { id: 2, name: "Review History project feedback", status: "in-progress", label: "In progress" },
    { id: 3, name: "Start Biology practical write-up", status: "todo", label: "To do" },
  ];

  const yesterdayTasks = [
    { id: 4, name: "Research for Economics SBA" },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center px-4">
          <h1 className="text-xl font-semibold">Tatenda</h1>
        </div>
      </header>

      {/* Main Content */}
      <div className="container max-w-4xl mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-4xl font-bold text-foreground mb-2">
            Welcome! 👋
          </h2>
          <p className="text-xl text-muted-foreground">
            How can I help you with your ZIMSEC SBA today?
          </p>
        </div>

        {/* Content Grid */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Previously Viewed Projects */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Folder01Icon className="w-5 h-5 text-brand" />
              <h3 className="font-semibold">Previously viewed projects</h3>
            </div>
            <div className="space-y-3">
              {recentProjects.map((project) => (
                <button
                  key={project.id}
                  className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors text-left"
                >
                  <FileTextIcon className="w-5 h-5 text-muted-foreground" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{project.title}</p>
                    <p className="text-xs text-muted-foreground">{project.subject}</p>
                  </div>
                </button>
              ))}
            </div>
          </Card>

          {/* Summarize Last Session */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Calendar03Icon className="w-5 h-5 text-brand" />
              <h3 className="font-semibold">Summarize your last session</h3>
            </div>
            <button className="w-full flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors text-left">
              <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                <span className="text-sm font-medium">TS</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">📅 History SBA Session</p>
                <p className="text-xs text-muted-foreground">1 Apr 2025, 2:00 pm</p>
              </div>
            </button>
          </Card>

          {/* Suggested Tasks */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <PlusSignIcon className="w-5 h-5 text-brand" />
              <h3 className="font-semibold">Suggested Task</h3>
            </div>
            <div className="space-y-2">
              {suggestedTasks.map((task) => (
                <button
                  key={task.id}
                  className="w-full flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors text-left"
                >
                  <span className="text-sm font-medium">{task.title}</span>
                  <ArrowRight01Icon className="w-4 h-4 text-muted-foreground" />
                </button>
              ))}
            </div>
          </Card>

          {/* Another Suggested Task */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <PlusSignIcon className="w-5 h-5 text-brand" />
              <h3 className="font-semibold">Suggested Task</h3>
            </div>
            <button className="w-full flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors text-left">
              <span className="text-sm font-medium">Create a Biology practical report</span>
              <ArrowRight01Icon className="w-4 h-4 text-muted-foreground" />
            </button>
          </Card>
        </div>

        {/* My Tasks Section */}
        <Card className="p-6 mb-20">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <FileTextIcon className="w-5 h-5 text-brand" />
              <h3 className="font-semibold">My Tasks</h3>
              <span className="text-xs text-muted-foreground">13</span>
            </div>
            <Button variant="ghost" size="sm" className="text-brand hover:text-brand/80">
              Prioritize Tasks
            </Button>
          </div>

          {/* Today */}
          <div className="mb-6">
            <h4 className="text-sm font-medium text-muted-foreground mb-3">Today</h4>
            <div className="space-y-2">
              {todayTasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className={`w-2 h-2 rounded-full ${
                    task.status === 'urgent' ? 'bg-red-500' : 
                    task.status === 'in-progress' ? 'bg-blue-500' : 
                    'bg-muted-foreground'
                  }`} />
                  <span className="flex-1 text-sm">{task.name}</span>
                  {task.time && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <ClockIcon className="w-3 h-3" />
                      <span>{task.time}</span>
                    </div>
                  )}
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    task.status === 'urgent' ? 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300' :
                    task.status === 'in-progress' ? 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300' :
                    'bg-muted text-muted-foreground'
                  }`}>
                    {task.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Yesterday */}
          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-3">Yesterday</h4>
            <div className="space-y-2">
              {yesterdayTasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="w-2 h-2 rounded-full bg-muted-foreground" />
                  <span className="flex-1 text-sm">{task.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Upgrade Banner */}
          <div className="mt-6 p-4 rounded-lg bg-muted/30 border">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-medium">⚡ Only 5 AI reports left!</span>
            </div>
            <p className="text-xs text-muted-foreground mb-3">
              Get deeper insights with more credits
            </p>
            <Button size="sm" className="bg-brand hover:bg-brand/90">
              Upgrade Now
            </Button>
          </div>
        </Card>

        {/* Input Section - Fixed at bottom */}
        <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-t">
          <div className="container max-w-4xl mx-auto px-4 py-4">
            <div className="relative">
              <PlusSignIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Ask or search for anything. Use @ to tag a project or subject."
                className="pl-10 pr-12 h-12 rounded-full border-2 focus-visible:ring-brand"
              />
              <Button
                size="icon"
                className="absolute right-1 top-1/2 -translate-y-1/2 rounded-full w-10 h-10 bg-brand hover:bg-brand/90"
              >
                <ArrowRight01Icon className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
