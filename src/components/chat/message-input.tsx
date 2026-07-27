"use client"

import { useState, useRef, useTransition, useEffect } from "react"
import { Send, Paperclip, Smile, Image as ImageIcon, X, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { sendMessage } from "@/actions/chat"
import { useRouter } from "next/navigation"
import EmojiPicker from "emoji-picker-react"
import { useTheme } from "next-themes"
import { createClient } from "@/lib/supabase/client"

interface MessageInputProps {
  conversationId: string
  currentUserId: string
}

export function MessageInput({ conversationId, currentUserId }: MessageInputProps) {
  const [message, setMessage] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const { theme } = useTheme()
  const [isPending, startTransition] = useTransition()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const emojiPickerRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const supabase = useRef(createClient()).current
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target as Node)) {
        setShowEmojiPicker(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  // Subscribe to channel so we can broadcast events
  useEffect(() => {
    const channel = supabase.channel(`realtime:messages:${conversationId}`)
    channel.subscribe()
    channelRef.current = channel
    return () => {
      supabase.removeChannel(channel)
    }
  }, [conversationId, supabase])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files)
      setSelectedFiles((prev) => [...prev, ...files])
      // Reset input so selecting the same file again works
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if ((!message.trim() && selectedFiles.length === 0) || isPending || isUploading) return
    
    setIsUploading(true)
    const attachments: { url: string; fileType: string; name: string }[] = []

    try {
      for (const file of selectedFiles) {
        const fileExt = file.name.split('.').pop()
        const fileName = `${crypto.randomUUID()}.${fileExt}`
        
        const { data, error } = await supabase.storage
          .from('chat-attachments')
          .upload(fileName, file)

        if (error) {
          console.error("Upload error:", error)
          throw error
        }

        const { data: { publicUrl } } = supabase.storage
          .from('chat-attachments')
          .getPublicUrl(fileName)

        attachments.push({
          url: publicUrl,
          fileType: file.type || 'application/octet-stream',
          name: file.name
        })
      }

      const content = message;
      setMessage("")
      setSelectedFiles([])
      
      // Clear typing indicator instantly
      setIsTyping(false)
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
      if (channelRef.current) {
        channelRef.current.send({
          type: 'broadcast',
          event: 'typing',
          payload: { userId: currentUserId, isTyping: false }
        }).catch(console.error)
      }
      
      const messageId = crypto.randomUUID()

      const optimisticMessage = {
        id: messageId,
        content,
        conversationId,
        createdAt: new Date().toISOString(),
        attachments,
        senderId: currentUserId, // Sender knows who they are, so isMe will be true!
      }

      // 1. Dispatch locally so the sender's UI updates instantly (0ms delay)
      window.dispatchEvent(new CustomEvent('local_optimistic_message', { detail: optimisticMessage }))

      // 2. Broadcast optimistically to the receiver before hitting the database
      if (channelRef.current) {
        channelRef.current.send({
          type: 'broadcast',
          event: 'optimistic_message',
          payload: optimisticMessage
        }).catch(console.error)
      }
      
      // Turn off the loader instantly!
      setIsUploading(false)
      
      // 3. Save to database in the background (fire-and-forget)
      Promise.resolve().then(async () => {
        try {
          await sendMessage(conversationId, content, attachments, messageId)
          
          // 4. Tell other clients in the channel to sync messages to get the real DB record
          if (channelRef.current) {
            await channelRef.current.send({
              type: 'broadcast',
              event: 'sync_messages',
              payload: { timestamp: Date.now() }
            })
          }
          
          // 5. Update server state
          router.refresh()
        } catch (bgError) {
          console.error("Background sync failed:", bgError)
        }
      })
      
    } catch (error) {
      console.error("Failed to upload files", error)
      alert("Failed to upload files. Make sure 'chat-attachments' bucket exists and is public in Supabase.")
      setIsUploading(false)
    }
  }

  const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value)
    
    if (!isTyping) {
      setIsTyping(true)
      if (channelRef.current) {
        channelRef.current.send({
          type: 'broadcast',
          event: 'typing',
          payload: { userId: currentUserId, isTyping: true }
        }).catch(console.error)
      }
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }

    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false)
      if (channelRef.current) {
        channelRef.current.send({
          type: 'broadcast',
          event: 'typing',
          payload: { userId: currentUserId, isTyping: false }
        }).catch(console.error)
      }
    }, 2000)
  }

  return (
    <div className="p-4 bg-transparent pb-6 relative z-10 w-full max-w-4xl mx-auto flex flex-col justify-end">
      {selectedFiles.length > 0 && (
        <div className="flex flex-wrap gap-3 mb-3 p-3 bg-card/80 backdrop-blur-md rounded-2xl border border-border/50 shadow-xl shadow-black/10">
          {selectedFiles.map((file, i) => (
            <div key={i} className="relative group bg-background border border-border/50 rounded-xl flex items-center p-1.5 pr-8 max-w-[200px]">
              {file.type.startsWith('image/') ? (
                <div className="h-10 w-10 shrink-0 bg-black/10 rounded-lg mr-2 overflow-hidden">
                  <img src={URL.createObjectURL(file)} alt="preview" className="h-full w-full object-cover" />
                </div>
              ) : (
                <div className="h-10 w-10 shrink-0 bg-primary/10 text-primary rounded-lg mr-2 flex items-center justify-center">
                  <Paperclip className="h-5 w-5" />
                </div>
              )}
              <span className="text-xs font-medium truncate">{file.name}</span>
              <button 
                type="button"
                onClick={() => removeFile(i)}
                className="absolute right-1.5 top-1/2 -translate-y-1/2 h-6 w-6 bg-black/40 hover:bg-red-500/80 text-white rounded-full flex items-center justify-center transition-colors"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      <form onSubmit={handleSend} className="flex items-center gap-3 w-full">
        
        <div className="flex-1 h-14 relative bg-card/80 backdrop-blur-md border border-border/50 rounded-full flex items-center px-2 shadow-lg shadow-black/10 focus-within:border-primary/40 focus-within:shadow-xl focus-within:shadow-primary/5 transition-all duration-300 group">
          <div className="relative h-full flex items-center justify-center ml-1">
            <Button 
              type="button" 
              variant="ghost" 
              size="icon" 
              className="text-foreground/90 hover:text-foreground shrink-0 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              <Paperclip className="h-6 w-6" />
            </Button>
          </div>
          <input 
            type="file" 
            className="hidden" 
            ref={fileInputRef}
            onChange={handleFileSelect}
            multiple 
            accept="image/*,.pdf,.doc,.docx,.zip,video/*,audio/*"
          />

          <Input
            value={message}
            onChange={handleTyping}
            placeholder="Type a message..."
            className="flex-1 h-full border-0 bg-transparent dark:bg-transparent shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 px-2 text-foreground placeholder:text-muted-foreground/60"
          />

          <div className="relative h-full flex items-center justify-center mr-1" ref={emojiPickerRef}>
            <Button 
              type="button" 
              variant="ghost" 
              size="icon" 
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="text-foreground/90 hover:text-foreground shrink-0 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
            >
              <Smile className="h-6 w-6" />
            </Button>
            
            {showEmojiPicker && (
              <div className="absolute bottom-[120%] right-0 z-50 shadow-2xl rounded-lg overflow-hidden border border-border/50">
                <EmojiPicker 
                  onEmojiClick={(emojiData) => {
                    setMessage((prev) => prev + emojiData.emoji)
                  }}
                  theme={theme === 'dark' ? 'dark' : 'light' as any}
                />
              </div>
            )}
          </div>
        </div>

        <Button 
          type="submit" 
          size="icon" 
          disabled={(!message.trim() && selectedFiles.length === 0) || isUploading} 
          className="rounded-full h-12 w-12 shrink-0 bg-gradient-to-br from-indigo-500 to-indigo-600 hover:from-indigo-400 hover:to-indigo-500 text-white shadow-md shadow-indigo-900/30 transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100 border border-indigo-400/20 flex items-center justify-center p-0"
        >
          {isUploading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Send className="h-5 w-5" />
          )}
        </Button>
      </form>
    </div>
  )
}
