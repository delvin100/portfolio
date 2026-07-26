"use client"

import { usePathname } from "next/navigation"

export function ChatLayoutClient({ children, sidebar }: { children: React.ReactNode, sidebar: React.ReactNode }) {
  const pathname = usePathname()
  
  // Check if we are on the settings page
  const isSettings = pathname === '/chat/settings'

  if (isSettings) {
    return (
      <div className="flex w-full h-[calc(100vh-4rem)] max-w-7xl mx-auto relative my-4">
        <div className="flex-1 flex flex-col relative z-10 w-full">
          {children}
        </div>
      </div>
    )
  }

  return (
    <div className="flex w-full h-[calc(100vh-4rem)] max-w-7xl mx-auto border border-border/40 rounded-2xl overflow-hidden shadow-2xl shadow-black/40 my-4 bg-gradient-to-b from-background to-background/50 relative">
      <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:32px_32px] pointer-events-none" />
      {sidebar}
      <div className="flex-1 bg-transparent flex flex-col relative z-10">
        {children}
      </div>
    </div>
  )
}
