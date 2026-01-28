"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import { Copy01Icon, Tick02Icon } from "@hugeicons/core-free-icons";
import { cn } from "@/lib/utils";
import hljs from "highlight.js/lib/core";
import typescript from "highlight.js/lib/languages/typescript";
import python from "highlight.js/lib/languages/python";
import javascript from "highlight.js/lib/languages/javascript";
import json from "highlight.js/lib/languages/json";
import css from "highlight.js/lib/languages/css";
import html from "highlight.js/lib/languages/xml";

// Register languages
hljs.registerLanguage("typescript", typescript);
hljs.registerLanguage("python", python);
hljs.registerLanguage("javascript", javascript);
hljs.registerLanguage("json", json);
hljs.registerLanguage("css", css);
hljs.registerLanguage("html", html);

interface CodeBlockProps {
  code: string;
  language?: string;
  filename?: string;
  className?: string;
}

const languageMap: Record<string, string> = {
  ts: "typescript",
  tsx: "typescript",
  js: "javascript",
  jsx: "javascript",
  py: "python",
  json: "json",
  css: "css",
  html: "html",
  xml: "html",
};

const languageLabels: Record<string, string> = {
  typescript: "TypeScript",
  python: "Python",
  javascript: "JavaScript",
  json: "JSON",
  css: "CSS",
  html: "HTML",
};

export function CodeBlock({
  code,
  language = "typescript",
  filename,
  className,
}: CodeBlockProps) {
  const normalizedLang = languageMap[language] || language;
  const [activeTab, setActiveTab] = useState(normalizedLang);
  const [copied, setCopied] = useState(false);
  const [showMore, setShowMore] = useState(false);
  const codeRef = useRef<HTMLPreElement>(null);

  // Determine available tabs based on language
  const availableTabs = [normalizedLang];
  
  // Only show TS/Python tabs for supported languages
  if (!["typescript", "python"].includes(normalizedLang)) {
    availableTabs.push("typescript", "python");
  } else if (normalizedLang === "typescript") {
    availableTabs.push("python");
  } else if (normalizedLang === "python") {
    availableTabs.push("typescript");
  }

  const handleCopy = () => {
    const activeCode = getCodeForLanguage(activeTab);
    navigator.clipboard.writeText(activeCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getCodeForLanguage = (lang: string) => {
    // For now, return the same code
    // In production, the AI would generate code in different languages
    return code;
  };

  const highlightCode = (code: string, lang: string) => {
    try {
      return hljs.highlight(code, { language: lang }).value;
    } catch {
      return hljs.highlightAuto(code).value;
    }
  };

  const activeCode = getCodeForLanguage(activeTab);
  const highlightedCode = highlightCode(activeCode, activeTab);

  // Check if code is long (more than 15 lines)
  const lines = activeCode.split("\n");
  const isLongCode = lines.length > 15;
  const displayCode = !showMore && isLongCode 
    ? lines.slice(0, 15).join("\n") 
    : activeCode;
  const displayHighlightedCode = !showMore && isLongCode
    ? highlightCode(displayCode, activeTab)
    : highlightedCode;

  return (
    <div className={cn("my-4 rounded-lg overflow-hidden border border-border bg-background", className)}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-muted/30 border-b border-border">
        {/* Tabs */}
        <div className="flex items-center gap-1">
          {availableTabs.map((lang) => (
            <button
              key={lang}
              onClick={() => setActiveTab(lang)}
              className={cn(
                "px-3 py-1 text-sm font-medium rounded transition-colors",
                activeTab === lang
                  ? "bg-background text-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-background/50"
              )}
            >
              {languageLabels[lang] || lang}
            </button>
          ))}
        </div>

        {/* Filename and Copy button */}
        <div className="flex items-center gap-2">
          {filename && (
            <span className="text-xs text-muted-foreground font-mono">
              {filename}
            </span>
          )}
          <Button
            size="sm"
            variant="ghost"
            onClick={handleCopy}
            className="h-7 px-2 text-xs"
          >
            <HugeiconsIcon 
              icon={copied ? Tick02Icon : Copy01Icon} 
              size={14} 
            />
            {copied ? "Copied!" : "Copy"}
          </Button>
        </div>
      </div>

      {/* Code content */}
      <div className="relative">
        <pre
          ref={codeRef}
          className="overflow-x-auto p-4 text-sm bg-background"
        >
          <code
            className="hljs"
            dangerouslySetInnerHTML={{ __html: displayHighlightedCode }}
          />
        </pre>

        {/* Show more button */}
        {isLongCode && (
          <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-background to-transparent pointer-events-none" />
        )}
      </div>

      {/* Show more/less button */}
      {isLongCode && (
        <div className="px-4 py-2 bg-muted/30 border-t border-border">
          <button
            onClick={() => setShowMore(!showMore)}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            {showMore ? "Show less ˄" : "Show more ˅"}
          </button>
        </div>
      )}
    </div>
  );
}
