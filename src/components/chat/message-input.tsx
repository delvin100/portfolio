"use client"

import { useState, useRef, useTransition } from "react"
import { Send, Paperclip, Smile, Image as ImageIcon, X, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { sendMessage } from "@/actions/chat"
import { useRouter } from "next/navigation"

interface MessageInputProps {
  conversationId: string
}

export function MessageInput({ conversationId }: MessageInputProps) {
  const [message, setMessage] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [isPending, startTransition] = useTransition()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim() || isPending) return
    
    const content = message;
    setMessage("")
    setIsTyping(false)
    
    // Fire and forget - don't block the UI
    sendMessage(conversationId, content)
      .then(() => {
        // Next.js refresh happens naturally through our realtime subscription anyway!
        // but we can still call it here just in case
        router.refresh()
      })
      .catch((error) => {
        console.error("Failed to send message", error)
      })
  }

  const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value)
    if (!isTyping) {
      setIsTyping(true)
      // Broadcast typing indicator
    }
  }

  return (
    <div className="p-4 bg-background border-t">
      <form onSubmit={handleSend} className="flex items-end gap-2">
        <div className="flex gap-1 pb-1">
          <Button 
            type="button" 
            variant="ghost" 
            size="icon" 
            className="text-muted-foreground hover:text-foreground shrink-0"
            onClick={() => fileInputRef.current?.click()}
          >
            <Paperclip className="h-5 w-5" />
          </Button>
          <input 
            type="file" 
            className="hidden" 
            ref={fileInputRef} 
            multiple 
            accept="image/*,.pdf,.doc,.docx,.zip,video/*,audio/*"
          />
        </div>

        <div className="flex-1 relative bg-muted/50 rounded-2xl flex items-center pr-2">
          <Button 
            type="button" 
            variant="ghost" 
            size="icon" 
            className="text-muted-foreground hover:text-foreground shrink-0 ml-1"
          >
            <Smile className="h-5 w-5" />
          </Button>
          <Input
            value={message}
            onChange={handleTyping}
            placeholder="Type a message"
            className="flex-1 border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 px-2 py-6"
          />
        </div>

        <Button 
          type="submit" 
          size="icon" 
          disabled={!message.trim()} 
          className="rounded-full h-12 w-12 shrink-0 bg-primary hover:bg-primary/90"
        >
          <Send className="h-5 w-5 ml-1" />
        </Button>
      </form>
    </div>
  )
}
