"use client"

import { useEffect, useRef, useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Check, CheckCheck } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

interface MessageListProps {
  initialMessages: any[]
  currentUserId: string
  conversationId: string
}

export function MessageList({ initialMessages, currentUserId, conversationId }: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null)
  const [messages, setMessages] = useState(initialMessages)
  const router = useRouter()
  
  // Memoize supabase client to prevent recreating it on every render
  const supabase = useRef(createClient()).current

  // Sync state with props in case of navigation or router.refresh()
  useEffect(() => {
    setMessages(initialMessages)
  }, [initialMessages])

  // Realtime subscription for incoming messages
  useEffect(() => {
    const channel = supabase
      .channel(`realtime:messages:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'Message',
          filter: `conversationId=eq.${conversationId}`
        },
        (payload) => {
          // Optimistically append the new message to state immediately for zero-latency UI
          const newMessage = payload.new as any
          setMessages((prev) => {
            // Check if we already have this message (e.g., if we sent it)
            if (prev.some(m => m.id === newMessage.id)) return prev
            
            return [...prev, newMessage]
          })
          
          // Still ask Next.js to re-fetch the page data in the background
          // This ensures we eventually get the fully populated message (with sender details) from Prisma
          router.refresh()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [conversationId, router, supabase])

  // Auto scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  return (
    <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 bg-muted/10">
      {/* Date Divider */}
      <div className="flex justify-center mb-4 mt-2">
        <span className="bg-muted text-muted-foreground text-xs font-medium px-3 py-1 rounded-md shadow-sm border">
          Today
        </span>
      </div>

      {messages.length === 0 ? (
        <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
          No messages yet. Send a message to start the conversation!
        </div>
      ) : null}

      {messages.map((msg) => {
        const isMe = msg.senderId === currentUserId
        const fallback = msg.sender?.name?.substring(0, 2).toUpperCase() || "U"
        
        // Format time 
        let timeStr = ""
        try {
          timeStr = new Date(msg.createdAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
        } catch(e) {
          timeStr = ""
        }

        return (
          <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
            <div className={`flex max-w-[75%] md:max-w-[65%] ${isMe ? "flex-row-reverse" : "flex-row"} gap-2`}>
              {!isMe && (
                <Avatar className="h-8 w-8 mt-auto hidden md:block">
                  <AvatarImage src={msg.sender?.profileImage || ""} />
                  <AvatarFallback>{fallback}</AvatarFallback>
                </Avatar>
              )}
              
              <div 
                className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}
              >
                <div 
                  className={`px-4 py-2 rounded-2xl shadow-sm ${
                    isMe 
                      ? "bg-primary text-primary-foreground rounded-br-sm" 
                      : "bg-card border rounded-bl-sm"
                  }`}
                >
                  <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">{msg.content}</p>
                </div>
                
                <div className="flex items-center gap-1 mt-1 px-1">
                  <span className="text-[10px] text-muted-foreground" suppressHydrationWarning>{timeStr}</span>
                  {isMe && (
                    <span className="text-muted-foreground">
                      <Check className="h-3 w-3" />
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )
      })}
      <div ref={bottomRef} className="h-1" />
    </div>
  )
}
