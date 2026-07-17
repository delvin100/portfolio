"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Check, Loader2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { getMessages } from "@/actions/chat"
import { Virtuoso, VirtuosoHandle } from "react-virtuoso"

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
  
  // Memoize supabase client
  const supabase = useRef(createClient()).current

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
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [conversationId, supabase])

  const loadMore = useCallback(async () => {
    if (!nextCursor || isLoadingMore) return
    setIsLoadingMore(true)
    try {
      const { messages: olderMessages, nextCursor: newCursor } = await getMessages(conversationId, nextCursor)
      // Prepend older messages
      setMessages((prev) => [...olderMessages, ...prev])
      setNextCursor(newCursor)
    } catch (e) {
      console.error(e)
    } finally {
      setIsLoadingMore(false)
    }
  }, [nextCursor, isLoadingMore, conversationId])

  const renderMessage = (index: number, msg: any) => {
    const isMe = msg.senderId === currentUserId
    const fallback = msg.sender?.name?.substring(0, 2).toUpperCase() || "U"
    
    let timeStr = ""
    try {
      timeStr = new Date(msg.createdAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
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
  }

  return (
    <div className="flex-1 p-4 bg-muted/10">
      {messages.length === 0 ? (
        <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
          No messages yet. Send a message to start the conversation!
        </div>
      ) : (
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
