"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Menu, X } from "lucide-react";
import { DocMeta } from "@/lib/docs";
import { Sidebar } from "@/components/docs/sidebar";
import { cn } from "@/lib/utils";

type MobileNavProps = {
  navItems: { title: string; items: DocMeta[] }[];
};

export function MobileNav({ navItems }: MobileNavProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Close the menu when navigating (when path changes) or when resizing to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsOpen(false);
      }
    };
    
    // Quick and dirty way to close on navigation since Sidebar uses standard Links
    const handleInteraction = (e: MouseEvent) => {
      if ((e.target as HTMLElement).closest("a")) {
        setIsOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    document.addEventListener("click", handleInteraction);
    return () => {
      window.removeEventListener("resize", handleResize);
      document.removeEventListener("click", handleInteraction);
    };
  }, []);

  // Prevent background scrolling when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center justify-center rounded-md p-2 hover:bg-muted md:hidden"
        aria-label="Open menu"
      >
        <Menu className="h-6 w-6" />
      </button>

      {/* Portal for Overlay and Drawer */}
      {mounted && createPortal(
        <>
          {/* Overlay */}
          {isOpen && (
            <div
              className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm md:hidden"
              onClick={() => setIsOpen(false)}
            />
          )}

          {/* Drawer */}
          <div
            className={cn(
              "fixed inset-y-0 left-0 z-50 w-full max-w-xs bg-background p-6 shadow-lg transition-transform duration-300 ease-in-out md:hidden flex flex-col",
              isOpen ? "translate-x-0" : "-translate-x-full"
            )}
          >
            <div className="flex items-center justify-between mb-8">
              <span className="font-bold text-lg">Menu</span>
              <button
                onClick={() => setIsOpen(false)}
                className="rounded-md p-2 hover:bg-muted"
                aria-label="Close menu"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto -mx-6 px-6">
              <Sidebar navItems={navItems} />
            </div>
          </div>
        </>,
        document.body
      )}
    </>
  );
}
