"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Bookmark, Check, CheckCheck, Loader2, MessageSquareDashed, Paperclip } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { getMessages, markMessagesAsRead, toggleMessageSaved } from "@/actions/chat"
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
  const [isOtherUserTyping, setIsOtherUserTyping] = useState(false)
  const router = useRouter()
  
  // Memoize supabase client
  const supabase = useRef(createClient()).current

  // Sync state when initialMessages changes (e.g. after sending a message and router.refresh())
  useEffect(() => {
    setMessages(prev => {
      const merged = [...prev]
      let changed = false
      for (const msg of initialMessages) {
        const existingIndex = merged.findIndex(m => m.id === msg.id)
        if (existingIndex === -1) {
          merged.push(msg)
          changed = true
        } else if (!merged[existingIndex].sender && msg.sender) {
          // If we had an optimistic message and now have the real one, replace it
          const wasRead = merged[existingIndex].isRead
          merged[existingIndex] = msg
          // Never revert a read message back to unread due to stale server state
          if (wasRead) {
            merged[existingIndex].isRead = true
          }
          changed = true
        } else {
          // If we already have the real message, check if its read status changed on the server
          if (!merged[existingIndex].isRead && msg.isRead) {
            merged[existingIndex].isRead = true
            changed = true
          }
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

  // Listen for local optimistic messages (from our own MessageInput)
  useEffect(() => {
    const handleLocalOptimistic = (e: any) => {
      const optimisticMsg = e.detail
      setMessages((prev) => {
        if (prev.some(m => m.id === optimisticMsg.id)) return prev
        // Append optimistically so sender sees it instantly (0ms delay)
        return [...prev, optimisticMsg]
      })
      setTimeout(() => {
        virtuosoRef.current?.scrollToIndex({ index: 999999, align: 'end', behavior: 'smooth' })
      }, 50)
    }
    window.addEventListener('local_optimistic_message', handleLocalOptimistic)
    return () => window.removeEventListener('local_optimistic_message', handleLocalOptimistic)
  }, [])

  // Listen to realtime messages via Supabase broadcasts
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
          
          setTimeout(() => {
            virtuosoRef.current?.scrollToIndex({ index: 999999, align: 'end', behavior: 'smooth' })
          }, 50)
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
      .on(
        'broadcast',
        { event: 'optimistic_message' },
        (payload) => {
          const optimisticMsg = payload.payload
          setMessages((prev) => {
            if (prev.some(m => m.id === optimisticMsg.id)) return prev
            // Append optimistically so receiver sees it instantly
            return [...prev, optimisticMsg]
          })
          
          setTimeout(() => {
            virtuosoRef.current?.scrollToIndex({ index: 999999, align: 'end', behavior: 'smooth' })
          }, 50)
        }
      )
      .on(
        'broadcast',
        { event: 'typing' },
        (payload) => {
          if (payload.payload.userId !== currentUserId) {
            setIsOtherUserTyping(payload.payload.isTyping)
            // If they started typing, maybe scroll to bottom so we see the indicator
            if (payload.payload.isTyping) {
              setTimeout(() => {
                virtuosoRef.current?.scrollToIndex({ index: 999999, align: 'end', behavior: 'smooth' })
              }, 50)
            }
          }
        }
      )
      .on(
        'broadcast',
        { event: 'message_saved' },
        (payload) => {
          const { messageId, isSaved } = payload.payload
          setMessages((prev) => prev.map(m => 
            m.id === messageId ? { ...m, isSaved } : m
          ))
        }
      )
      .on(
        'broadcast',
        { event: 'read_receipt' },
        (payload) => {
          if (payload.payload.readBy !== currentUserId) {
            setMessages((prev) => prev.map(m => 
              (m.senderId === currentUserId && !m.isRead) ? { ...m, isRead: true } : m
            ))
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [conversationId, supabase, router, currentUserId])

  // Mark messages as read and broadcast receipt for local state
  useEffect(() => {
    const hasUnread = messages.some(m => !m.isRead && m.senderId !== currentUserId)
    if (hasUnread) {
      Promise.resolve().then(async () => {
        try {
          await markMessagesAsRead(conversationId)
          // Broadcast read receipt
          const channel = supabase.channel(`realtime:messages:${conversationId}`)
          channel.send({
            type: 'broadcast',
            event: 'read_receipt',
            payload: { conversationId, readBy: currentUserId }
          }).catch(console.error)
          
          // Optimistically update our own state
          setMessages(prev => prev.map(m => 
            (m.senderId !== currentUserId && !m.isRead) ? { ...m, isRead: true } : m
          ))
        } catch (e) {
          console.error("Failed to mark as read:", e)
        }
      })
    }
  }, [messages, conversationId, currentUserId, supabase])

  // Fix DB race condition: if the server STILL thinks there are unread messages (because we marked them before they were inserted), mark them again!
  useEffect(() => {
    const hasUnreadOnServer = initialMessages.some(m => !m.isRead && m.senderId !== currentUserId)
    if (hasUnreadOnServer) {
      Promise.resolve().then(async () => {
        try {
          await markMessagesAsRead(conversationId)
          const channel = supabase.channel(`realtime:messages:${conversationId}`)
          channel.send({
            type: 'broadcast',
            event: 'read_receipt',
            payload: { conversationId, readBy: currentUserId }
          }).catch(console.error)
        } catch (e) {
          console.error("Failed to mark server messages as read:", e)
        }
      })
    }
  }, [initialMessages, conversationId, currentUserId, supabase])

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

  const handleToggleSave = async (messageId: string, isSaved: boolean) => {
    // Optimistic update
    setMessages(prev => prev.map(m => m.id === messageId ? { ...m, isSaved } : m))

    // Broadcast the change to the other user
    const channel = supabase.channel(`realtime:messages:${conversationId}`)
    channel.send({
      type: 'broadcast',
      event: 'message_saved',
      payload: { messageId, isSaved }
    }).catch(console.error)

    try {
      await toggleMessageSaved(messageId, isSaved)
    } catch (e) {
      console.error("Failed to toggle save state:", e)
      // Revert on failure
      setMessages(prev => prev.map(m => m.id === messageId ? { ...m, isSaved: !isSaved } : m))
    }
  }

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
          
          <div className={`flex flex-col ${isMe ? "items-end" : "items-start"} max-w-full overflow-hidden`}>
            <div className={`group relative flex items-center gap-2 ${isMe ? "flex-row" : "flex-row-reverse"}`}>
              <button 
                onClick={() => handleToggleSave(msg.id, !msg.isSaved)}
                className={`opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/5 ${msg.isSaved ? 'opacity-100 text-amber-500 hover:text-amber-600' : 'text-muted-foreground'} flex-shrink-0`}
                title={msg.isSaved ? "Unsave message" : "Save message"}
              >
                <Bookmark className={`h-4 w-4 ${msg.isSaved ? "fill-current" : ""}`} />
              </button>
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
            </div>
            
            <div className="flex items-center gap-1 mt-1 px-1">
              <span className="text-[10px] text-muted-foreground" suppressHydrationWarning>{timeStr}</span>
              {isMe && (
                <span className="text-muted-foreground">
                  {msg.isRead ? (
                    <CheckCheck className="h-3 w-3 text-indigo-200" />
                  ) : (
                    <Check className="h-3 w-3" />
                  )}
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
            ),
            Footer: () => (
              <div className="py-2">
                {isOtherUserTyping && (
                  <div className="flex justify-start animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div className="flex max-w-[75%] md:max-w-[65%] flex-row gap-2">
                      <Avatar className="h-8 w-8 mt-auto hidden md:block">
                        <AvatarFallback>?</AvatarFallback>
                      </Avatar>
                      <div className="bg-card border border-border/40 rounded-2xl rounded-bl-sm p-4 shadow-sm flex items-center gap-1.5 h-[42px]">
                        <span className="w-1.5 h-1.5 bg-foreground/50 rounded-full animate-bounce"></span>
                        <span className="w-1.5 h-1.5 bg-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }}></span>
                        <span className="w-1.5 h-1.5 bg-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></span>
                      </div>
                    </div>
                  </div>
                )}
                {!isOtherUserTyping && <div className="h-2" />}
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
