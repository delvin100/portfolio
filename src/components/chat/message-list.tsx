"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Check, Loader2, MessageSquareDashed, Paperclip } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { getMessages } from "@/actions/chat"
import { getInitials } from "@/lib/utils"
import { Virtuoso, VirtuosoHandle } from "react-virtuoso"
import { useRouter } from "next/navigation"

interface MessageListProps {
  initialMessages: any[]
  initialNextCursor?: string
  currentUserId: string
  conversationId: string
}

export function MessageList({ initialMessages, initialNextCursor, currentUserId, conversationId }: MessageListProps) {
  const virtuosoRef = useRef<VirtuosoHandle>(null)
  const [messages, setMessages] = useState(initialMessages)
  const [nextCursor, setNextCursor] = useState(initialNextCursor)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const router = useRouter()
  
  // Memoize supabase client
  const supabase = useRef(createClient()).current

  // Sync state when initialMessages changes (e.g. after sending a message and router.refresh())
  useEffect(() => {
    setMessages(prev => {
      const merged = [...prev]
      let changed = false
      for (const msg of initialMessages) {
        if (!merged.some(m => m.id === msg.id)) {
          merged.push(msg)
          changed = true
        }
      }
      if (changed) {
        return merged.sort((a, b) => {
          const timeA = new Date(typeof a.createdAt === 'string' && !a.createdAt.endsWith('Z') ? a.createdAt + 'Z' : a.createdAt).getTime()
          const timeB = new Date(typeof b.createdAt === 'string' && !b.createdAt.endsWith('Z') ? b.createdAt + 'Z' : b.createdAt).getTime()
          return timeA - timeB
        })
      }
      return prev
    })
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
        async (payload) => {
          const newMessage = payload.new as any
          
          setMessages((prev) => {
            if (prev.some(m => m.id === newMessage.id)) return prev
            // We'll append it optimistically
            return [...prev, newMessage]
          })
          
          // Pure client realtime: no router.refresh()! 
          // We don't have the sender object on the payload.
          // In a production app with this architecture, you'd fetch the sender here if needed.
          // Since it's a 1-on-1 chat, we often know the sender visually already.
        }
      )
      .on(
        'broadcast',
        { event: 'sync_messages' },
        (payload) => {
          // Received a manual broadcast to sync messages!
          // This ensures the receiver fetches the latest messages even if postgres_changes fails.
          router.refresh()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [conversationId, supabase, router])

  const loadMore = useCallback(async () => {
    if (!nextCursor || isLoadingMore) return
    setIsLoadingMore(true)
    try {
      const { messages: olderMessages, nextCursor: newCursor } = await getMessages(conversationId, nextCursor)
      // Prepend older messages
      setMessages((prev) => {
        // filter out any duplicates just in case
        const uniqueOlder = olderMessages.filter(om => !prev.some(pm => pm.id === om.id))
        return [...uniqueOlder, ...prev]
      })
      setNextCursor(newCursor)
    } catch (e) {
      console.error(e)
    } finally {
      setIsLoadingMore(false)
    }
  }, [nextCursor, isLoadingMore, conversationId])

  const renderMessage = (index: number, msg: any) => {
    const isMe = msg.senderId === currentUserId
    const fallback = getInitials(msg.sender?.name)
    
    let timeStr = ""
    try {
      // Supabase realtime timestamps might lack the 'Z' which causes them to be parsed as local time.
      let dateValue = msg.createdAt
      if (typeof dateValue === 'string' && !dateValue.endsWith('Z')) {
        dateValue = dateValue + 'Z'
      }
      timeStr = new Date(dateValue).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
    } catch(e) {
      timeStr = ""
    }

    return (
      <div className={`flex py-2 ${isMe ? "justify-end" : "justify-start"}`}>
        <div className={`flex max-w-[75%] md:max-w-[65%] ${isMe ? "flex-row-reverse" : "flex-row"} gap-2`}>
          {!isMe && (
            <Avatar className="h-8 w-8 mt-auto hidden md:block">
              <AvatarImage src={msg.sender?.profileImage || ""} />
              <AvatarFallback>{fallback}</AvatarFallback>
            </Avatar>
          )}
          
          <div className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}>
            <div 
              className={`px-4 py-2.5 rounded-2xl shadow-sm ${
                isMe 
                  ? "bg-gradient-to-br from-indigo-600 to-indigo-500 text-white rounded-br-sm shadow-indigo-900/20" 
                  : "bg-card border border-border/40 rounded-bl-sm text-card-foreground shadow-black/5"
              }`}
            >
              {msg.attachments && msg.attachments.length > 0 && (
                <div className={`flex flex-col gap-2 ${msg.content ? 'mb-3' : ''}`}>
                  {msg.attachments.map((att: any, i: number) => (
                    att.fileType?.startsWith('image/') ? (
                      <a key={i} href={att.url} target="_blank" rel="noopener noreferrer" className="block relative rounded-lg overflow-hidden border border-white/10 max-w-xs sm:max-w-sm">
                        <img src={att.url} alt={att.name} className="w-full h-auto max-h-64 object-cover hover:scale-105 transition-transform duration-500" />
                      </a>
                    ) : (
                      <a 
                        key={i} 
                        href={att.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-2.5 rounded-xl bg-black/10 hover:bg-black/20 dark:bg-white/10 dark:hover:bg-white/20 transition-colors border border-white/5"
                      >
                        <div className="h-10 w-10 shrink-0 bg-background/50 rounded-lg flex items-center justify-center text-current">
                          <Paperclip className="h-5 w-5" />
                        </div>
                        <span className="text-sm font-medium truncate max-w-[150px] sm:max-w-[200px]">{att.name}</span>
                      </a>
                    )
                  ))}
                </div>
              )}
              {msg.content && (
                <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">{msg.content}</p>
              )}
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
  }

  return (
    <div className="flex-1 p-4 bg-transparent flex flex-col h-full overflow-hidden">
      {messages.length === 0 && (
        <div className="flex-1 flex flex-col items-center justify-center p-8 min-h-0 text-center animate-in fade-in duration-700">
          <div className="relative group mb-6">
            <div className="absolute inset-0 bg-indigo-500/20 rounded-full blur-xl group-hover:bg-indigo-500/30 transition-colors duration-700" />
            <div className="w-20 h-20 rounded-full border border-indigo-500/20 bg-card/50 backdrop-blur-sm flex items-center justify-center relative z-10 shadow-[0_0_15px_rgba(99,102,241,0.1)] group-hover:scale-105 transition-transform duration-500">
              <MessageSquareDashed className="h-8 w-8 text-indigo-400 group-hover:text-indigo-300 transition-colors duration-500" strokeWidth={1.5} />
            </div>
          </div>
          <h3 className="text-xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-white/90 to-white/60 mb-3 tracking-tight">
            Start the conversation
          </h3>
          <p className="text-sm text-muted-foreground max-w-sm leading-relaxed">
            Send a message below to begin chatting. Your conversation will be securely saved here.
          </p>
        </div>
      )}
      {messages.length > 0 && (
        <Virtuoso
          ref={virtuosoRef}
          data={messages}
          firstItemIndex={0}
          initialTopMostItemIndex={messages.length - 1}
          startReached={loadMore}
          itemContent={renderMessage}
          components={{
            Header: () => (
              <div className="flex justify-center py-4">
                {isLoadingMore ? (
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                ) : !nextCursor ? (
                  <span className="text-xs text-muted-foreground">Beginning of conversation</span>
                ) : null}
              </div>
            )
          }}
          followOutput="smooth"
          className="h-full w-full"
        />
      )}
    </div>
  )
}
