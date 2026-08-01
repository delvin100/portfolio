"use client"

import { useEffect, useState, useRef } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { usePresence } from "@/components/chat/presence-provider"
import { getInitials } from "@/lib/utils"
import Link from "next/link"
import { Edit } from "lucide-react"

interface ChatHeaderProps {
  otherUser: {
    id: string
    name: string
    username: string
    profileImage: string | null
    status: string | null
  }
  isAdmin?: boolean
}

export function ChatHeader({ otherUser, isAdmin = false }: ChatHeaderProps) {
  const { onlineUsers } = usePresence()
  const isOnline = onlineUsers.includes(otherUser.id)

  const fallback = getInitials(otherUser.name)

  return (
    <div className="relative px-6 py-4 flex items-center justify-between bg-background/60 backdrop-blur-md z-10 border-b border-border/40 shadow-sm">
      <div className="flex items-center gap-4 group cursor-default">
        <div className="relative">
          {/* Subtle glow behind avatar */}
          <div className="absolute inset-0 bg-indigo-500/20 rounded-full blur-md scale-110 group-hover:scale-125 transition-transform duration-500" />
          
          <Avatar className="h-11 w-11 ring-2 ring-background ring-offset-2 ring-offset-indigo-500/10 shadow-lg relative z-10 transition-transform duration-300 group-hover:scale-105">
            <AvatarImage src={otherUser.profileImage || ""} />
            <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-medium shadow-inner">
              {fallback}
            </AvatarFallback>
          </Avatar>
          
          {isOnline ? (
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-background rounded-full z-20 shadow-[0_0_8px_rgba(16,185,129,0.5)] ring-2 ring-emerald-500/20"></span>
          ) : (
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-zinc-500 border-2 border-background rounded-full z-20"></span>
          )}
        </div>
        <div className="flex flex-col justify-center">
          <h3 className="text-base sm:text-lg font-bold tracking-tight leading-none mb-1.5 text-foreground/90 group-hover:text-foreground transition-colors">
            {otherUser.name || "Unknown"}
          </h3>
          <p className={`text-xs font-medium transition-colors duration-300 ${isOnline ? 'text-emerald-500/80' : 'text-muted-foreground'}`}>
            {isOnline ? "Online" : "Offline"}
          </p>
        </div>
      </div>
      
      {!isAdmin && (
        <div className="flex items-center gap-1.5 bg-black/10 dark:bg-white/5 p-1 rounded-full border border-black/5 dark:border-white/5 shadow-inner backdrop-blur-md">
          <Link 
            href="/chat/settings" 
            className="p-2 rounded-full hover:bg-black/10 dark:hover:bg-white/10 text-muted-foreground hover:text-foreground transition-colors"
            title="Edit Settings"
          >
            <Edit className="h-4 w-4" strokeWidth={2.5} />
          </Link>
        </div>
      )}
    </div>
  )
}
