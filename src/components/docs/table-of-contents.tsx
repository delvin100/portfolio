"use client";

import { useEffect, useState, useRef } from "react";
import { cn } from "@/lib/utils";

type Heading = {
  id: string;
  text: string;
  level: number;
};

export function TableOfContents({ headings }: { headings: Heading[] }) {
  const [activeId, setActiveId] = useState<string>("");
  const [isScrolling, setIsScrolling] = useState(false);
  const scrollTimeoutRef = useRef<NodeJS.Timeout>(null);

  const handleScroll = () => {
    setIsScrolling(true);
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }
    scrollTimeoutRef.current = setTimeout(() => {
      setIsScrolling(false);
    }, 1000);
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: "0% 0% -80% 0%" }
    );

    headings.forEach((heading) => {
      const element = document.getElementById(heading.id);
      if (element) {
        observer.observe(element);
      }
    });

    return () => {
      observer.disconnect();
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
    };
  }, [headings]);

  if (headings.length === 0) return null;

  return (
    <div 
      className={cn(
        "space-y-4 max-h-[calc(100vh-6rem)] overflow-y-auto custom-scrollbar pr-4",
        isScrolling ? "is-scrolling" : ""
      )}
      onScroll={handleScroll}
    >
      <h4 className="font-semibold text-sm">On This Page</h4>
      <div className="flex flex-col gap-2.5 text-sm pb-8">
        {headings.map((heading) => (
          <a
            key={heading.id}
            href={`#${heading.id}`}
            className={cn(
              "text-muted-foreground hover:text-primary transition-colors",
              activeId === heading.id && "text-primary font-medium",
              heading.level === 3 && "ml-4"
            )}
          >
            {heading.text}
          </a>
        ))}
      </div>
    </div>
  );
}
