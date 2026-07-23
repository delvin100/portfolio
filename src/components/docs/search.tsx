"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search as SearchIcon, Command, FileText } from "lucide-react";
import Fuse from "fuse.js";
import { cn } from "@/lib/utils";

type SearchItem = {
  slug: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
};

export function Search() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchItem[]>([]);
  const [index, setIndex] = useState<SearchItem[]>([]);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  // Fetch search index on mount
  useEffect(() => {
    fetch("/api/docs/search")
      .then((res) => res.json())
      .then((data) => setIndex(data))
      .catch(console.error);
  }, []);

  // Handle Cmd+K shortcut
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setIsOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery("");
      setResults([]);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const fuse = new Fuse(index, {
      keys: ["title", "description", "tags"],
      threshold: 0.3,
      includeScore: true,
    });

    const searchResults = fuse.search(query).map((res) => res.item);
    setResults(searchResults.slice(0, 8)); // Limit to 8 results
  }, [query, index]);

  const handleSelect = (slug: string) => {
    setIsOpen(false);
    router.push(`/git/${slug}`);
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 w-full max-w-sm px-3 py-1.5 text-sm text-muted-foreground bg-muted/50 border border-border rounded-md hover:bg-muted/80 transition-colors"
      >
        <SearchIcon className="w-4 h-4" />
        <span className="flex-1 text-left">Search documentation...</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh] sm:pt-[10vh]">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-background/80 backdrop-blur-sm transition-opacity"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Modal */}
          <div className="relative w-full max-w-xl bg-card border border-border rounded-lg shadow-xl overflow-hidden glass animate-in fade-in slide-in-from-top-4">
            <div className="flex items-center px-4 border-b border-border">
              <SearchIcon className="w-5 h-5 text-muted-foreground" />
              <input
                ref={inputRef}
                type="text"
                className="w-full px-4 py-4 bg-transparent outline-none placeholder:text-muted-foreground text-foreground"
                placeholder="Search commands, workflows..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <button 
                onClick={() => setIsOpen(false)}
                className="text-xs text-muted-foreground hover:text-foreground border border-border rounded px-1.5 py-0.5"
              >
                ESC
              </button>
            </div>

            <div className="max-h-[60vh] overflow-y-auto p-2">
              {results.length > 0 ? (
                <div className="flex flex-col gap-1">
                  {results.map((item) => (
                    <button
                      key={item.slug}
                      onClick={() => handleSelect(item.slug)}
                      className="flex items-start gap-3 p-3 w-full text-left rounded-md hover:bg-muted/50 transition-colors"
                    >
                      <div className="mt-0.5 bg-primary/10 p-1.5 rounded-md text-primary">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-medium text-foreground">{item.title}</div>
                        {item.description && (
                          <div className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                            {item.description}
                          </div>
                        )}
                        <div className="text-[10px] uppercase tracking-wider font-semibold text-primary/60 mt-1.5">
                          {item.category}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              ) : query.trim() ? (
                <div className="py-14 text-center text-sm text-muted-foreground">
                  No results found for "{query}"
                </div>
              ) : (
                <div className="py-8 text-center text-sm text-muted-foreground">
                  Start typing to search...
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
