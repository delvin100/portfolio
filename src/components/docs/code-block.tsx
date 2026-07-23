"use client";

import React, { useState } from "react";
import { Check, Copy } from "lucide-react";
import { cn } from "@/lib/utils";

// Custom Pre block to include Copy button
export function CodeBlock({ children, className, ...props }: React.HTMLAttributes<HTMLPreElement>) {
  const [copied, setCopied] = useState(false);
  
  // Extract string content from children for copying
  const extractText = (node: React.ReactNode): string => {
    if (typeof node === "string") return node;
    if (typeof node === "number") return node.toString();
    if (React.isValidElement<{children?: React.ReactNode}>(node)) {
      return extractText(node.props.children);
    }
    if (Array.isArray(node)) {
      return node.map(extractText).join("");
    }
    return "";
  };

  const onCopy = async () => {
    const text = extractText(children);
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="group relative my-6 rounded-lg bg-muted/60 border border-border shadow-sm">
      <pre className={cn("p-4 overflow-x-auto text-[15px] font-mono", className)} {...props}>
        {children}
      </pre>
      <button
        onClick={onCopy}
        className="absolute right-2 top-2 p-2 rounded-md bg-background/80 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-background text-foreground"
        aria-label="Copy code"
      >
        {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
      </button>
    </div>
  );
}
