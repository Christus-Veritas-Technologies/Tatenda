"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Components } from "react-markdown";
import { cn } from "@/lib/utils";
import { CodeBlock } from "./code-block";

// Import highlight.js styles for light mode
import "highlight.js/styles/github.min.css";

interface MarkdownRendererProps {
  content: string;
  className?: string;
  isStreaming?: boolean;
}

/**
 * Custom Markdown Renderer Component
 *
 * Renders markdown content with:
 * - GitHub Flavored Markdown support (tables, strikethrough, etc.)
 * - Syntax highlighting for code blocks
 * - Custom styling for headings, lists, links, etc.
 * - Real-time streaming support with cursor animation
 */
export function MarkdownRenderer({
  content,
  className,
  isStreaming = false,
}: MarkdownRendererProps) {
  const components: Components = {
    // Headings
    h1: ({ children }) => (
      <h1 className="text-2xl font-bold mt-6 mb-3 text-foreground first:mt-0">
        {children}
      </h1>
    ),
    h2: ({ children }) => (
      <h2 className="text-xl font-bold mt-5 mb-2 text-foreground first:mt-0">
        {children}
      </h2>
    ),
    h3: ({ children }) => (
      <h3 className="text-lg font-semibold mt-4 mb-2 text-foreground first:mt-0">
        {children}
      </h3>
    ),
    h4: ({ children }) => (
      <h4 className="text-base font-semibold mt-3 mb-1 text-foreground first:mt-0">
        {children}
      </h4>
    ),
    h5: ({ children }) => (
      <h5 className="text-sm font-semibold mt-2 mb-1 text-foreground first:mt-0">
        {children}
      </h5>
    ),
    h6: ({ children }) => (
      <h6 className="text-xs font-semibold mt-2 mb-1 text-muted-foreground first:mt-0">
        {children}
      </h6>
    ),

    // Paragraphs
    p: ({ children }) => (
      <p className="mb-3 last:mb-0 leading-relaxed">{children}</p>
    ),

    // Strong/Bold
    strong: ({ children }) => (
      <strong className="font-semibold text-foreground">{children}</strong>
    ),

    // Emphasis/Italic
    em: ({ children }) => <em className="italic">{children}</em>,

    // Links
    a: ({ href, children }) => (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="text-brand hover:text-brand/80 underline underline-offset-2 transition-colors"
      >
        {children}
      </a>
    ),

    // Lists
    ul: ({ children }) => (
      <ul className="list-disc list-inside mb-3 space-y-1 ml-2">{children}</ul>
    ),
    ol: ({ children }) => (
      <ol className="list-decimal list-inside mb-3 space-y-1 ml-2">
        {children}
      </ol>
    ),
    li: ({ children }) => <li className="leading-relaxed">{children}</li>,

    // Blockquotes
    blockquote: ({ children }) => (
      <blockquote className="border-l-4 border-brand/50 pl-4 py-1 my-3 bg-muted/50 rounded-r italic">
        {children}
      </blockquote>
    ),

    // Code blocks
    code: ({ className, children, ...props }) => {
      const match = /language-(\w+)/.exec(className || "");
      const language = match ? match[1] : undefined;
      const isInline = !match && !className;

      if (isInline) {
        // Inline code
        return (
          <code
            className="px-1.5 py-0.5 bg-muted rounded text-sm font-mono text-brand"
            {...props}
          >
            {children}
          </code>
        );
      }

      // Extract filename from code fence info string (e.g., ```typescript:filename.ts)
      const fullMatch = className?.match(/language-(\w+)(?::(.+))?/);
      const filename = fullMatch?.[2];

      // Code block - handled by pre wrapper
      return (
        <code className={cn("text-sm", className)} {...props}>
          {children}
        </code>
      );
    },

    // Pre (code block wrapper)
    pre: ({ children, ...props }) => {
      // Extract code content and language from children
      const childArray = Array.isArray(children) ? children : [children];
      const codeElement = childArray.find(
        (child: any) => child?.type === "code"
      ) as any;

      if (!codeElement) {
        return <pre {...props}>{children}</pre>;
      }

      const className = codeElement.props?.className || "";
      const match = /language-(\w+)(?::(.+))?/.exec(className);
      const language = match?.[1];
      const filename = match?.[2];
      const code = String(codeElement.props?.children || "").replace(/\n$/, "");

      if (!language) {
        // No language specified, render simple pre
        return (
          <pre className="overflow-x-auto rounded-lg bg-muted p-4 text-sm my-3">
            {children}
          </pre>
        );
      }

      return (
        <CodeBlock
          code={code}
          language={language}
          filename={filename}
        />
      );
    },

    // Tables
    table: ({ children }) => (
      <div className="overflow-x-auto my-3">
        <table className="w-full border-collapse border border-border rounded-lg">
          {children}
        </table>
      </div>
    ),
    thead: ({ children }) => (
      <thead className="bg-muted/50">{children}</thead>
    ),
    tbody: ({ children }) => <tbody>{children}</tbody>,
    tr: ({ children }) => (
      <tr className="border-b border-border last:border-0">{children}</tr>
    ),
    th: ({ children }) => (
      <th className="px-4 py-2 text-left font-semibold text-foreground">
        {children}
      </th>
    ),
    td: ({ children }) => (
      <td className="px-4 py-2 text-muted-foreground">{children}</td>
    ),

    // Horizontal rule
    hr: () => <hr className="my-6 border-border" />,

    // Images
    img: ({ src, alt }) => (
      <img
        src={src}
        alt={alt || ""}
        className="max-w-full h-auto rounded-lg my-3"
        loading="lazy"
      />
    ),

    // Delete/Strikethrough
    del: ({ children }) => (
      <del className="line-through text-muted-foreground">{children}</del>
    ),
  };

  return (
    <div className={cn("prose prose-sm max-w-none text-foreground", className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={components}
      >
        {content}
      </ReactMarkdown>
      {/* Streaming cursor */}
      {isStreaming && !content && (
        <span className="inline-block w-2 h-4 bg-muted-foreground animate-pulse" />
      )}
    </div>
  );
}
