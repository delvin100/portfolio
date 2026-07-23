"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { DocMeta } from "@/lib/docs";
import { ChevronRight } from "lucide-react";
import { useState, useRef, useEffect } from "react";

type SidebarProps = {
  navItems: { title: string; items: DocMeta[] }[];
};

export function Sidebar({ navItems }: SidebarProps) {
  const pathname = usePathname();
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
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);
  
  return (
    <div 
      className={cn(
        "w-full h-full py-6 pr-6 overflow-y-auto custom-scrollbar",
        isScrolling ? "is-scrolling" : ""
      )}
      onScroll={handleScroll}
    >
      <div className="flex flex-col gap-8">
        <div className="flex flex-col gap-2">
          <h4 className="font-semibold text-sm tracking-tight text-foreground">
            Overview
          </h4>
          <div className="flex flex-col gap-1 border-l border-border/50 ml-1">
            <Link
              href="/git"
              className={cn(
                "group flex w-full items-center pl-4 py-1.5 text-sm font-medium hover:text-primary transition-colors",
                pathname === "/git" || pathname === "/git/"
                  ? "text-primary border-l-2 border-primary -ml-[1px]"
                  : "text-muted-foreground border-l-2 border-transparent -ml-[1px]"
              )}
            >
              Learning Hub Home
            </Link>
          </div>
        </div>
        {navItems.map((group) => (
          <div key={group.title} className="flex flex-col gap-2">
            <h4 className="font-semibold text-sm tracking-tight text-foreground">
              {group.title}
            </h4>
            <div className="flex flex-col gap-1 border-l border-border/50 ml-1">
              {group.items.map((item) => {
                const isActive = pathname === `/git/${item.slug}`;
                return (
                  <Link
                    key={item.slug}
                    href={`/git/${item.slug}`}
                    className={cn(
                      "group flex w-full items-center pl-4 py-1.5 text-sm font-medium hover:text-primary transition-colors",
                      isActive
                        ? "text-primary border-l-2 border-primary -ml-[1px]"
                        : "text-muted-foreground border-l-2 border-transparent -ml-[1px]"
                    )}
                  >
                    {item.title}
                    {isActive && (
                      <ChevronRight className="ml-auto w-4 h-4 opacity-50" />
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
