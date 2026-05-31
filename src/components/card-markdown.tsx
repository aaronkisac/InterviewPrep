"use client";

// Lightweight markdown renderer for question cards (client component).
// Renders bold, italic, inline code, links, and lists — but NOT fenced
// code blocks or headings (those belong on the detail page only).
// No syntax highlighting to keep the bundle small.

import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Components } from "react-markdown";

const components: Components = {
  // Suppress headings — cards show summary text, not full docs
  h1: ({ children }) => <strong>{children}</strong>,
  h2: ({ children }) => <strong>{children}</strong>,
  h3: ({ children }) => <strong>{children}</strong>,
  // Fenced code blocks → inline style (no syntax highlight in card)
  pre: ({ children }) => (
    <span className="block rounded border border-border bg-muted px-2 py-1 font-mono text-xs my-1">
      {children}
    </span>
  ),
  code: ({ children, className }) => {
    // Block code (inside pre) vs inline code
    const isBlock = className?.startsWith("language-");
    if (isBlock) return <>{children}</>;
    return (
      <code className="rounded bg-muted px-1 py-0.5 font-mono text-[0.85em]">
        {children}
      </code>
    );
  },
  p: ({ children }) => <span className="block">{children}</span>,
  ul: ({ children }) => <ul className="list-disc pl-5 my-1 space-y-0.5">{children}</ul>,
  ol: ({ children }) => <ol className="list-decimal pl-5 my-1 space-y-0.5">{children}</ol>,
  li: ({ children }) => <li className="text-sm">{children}</li>,
  strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
  em: ({ children }) => <em className="italic">{children}</em>,
  a: ({ href, children }) => (
    <a href={href} className="underline underline-offset-2 hover:opacity-80" target="_blank" rel="noopener noreferrer">
      {children}
    </a>
  ),
};

export function CardMarkdown({ text }: { text: string }) {
  return (
    <Markdown remarkPlugins={[remarkGfm]} components={components}>
      {text}
    </Markdown>
  );
}
