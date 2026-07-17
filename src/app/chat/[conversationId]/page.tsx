import { MessageList } from "@/components/chat/message-list"
import { MessageInput } from "@/components/chat/message-input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Phone, Video, MoreVertical } from "lucide-react"
import { getConversationDetails, getMessages } from "@/actions/chat"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { use } from "react"

export default async function ChatWindow(props: { params: Promise<{ conversationId: string }> }) {
  const params = await props.params;
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/chat-login')
  }
  
  const conversationId = params.conversationId
  const details = await getConversationDetails(conversationId)
  
  if (!details) {
    return <div className="flex items-center justify-center h-full">Conversation not found.</div>
  }
  
  const { messages, nextCursor } = await getMessages(conversationId)
  
  const { otherUser } = details
  const fallback = otherUser?.name?.substring(0, 2).toUpperCase() || "U"

  return (
    <div className="flex flex-col h-full">
      {/* Chat Header */}
      <div className="p-3 border-b flex items-center justify-between bg-background/95 backdrop-blur z-10">
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarImage src={otherUser?.profileImage || ""} />
            <AvatarFallback>{fallback}</AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-semibold leading-none mb-1">{otherUser?.name || "Unknown"}</h3>
            <p className="text-xs text-muted-foreground">{otherUser?.status || "Offline"}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-1 text-muted-foreground">
          <Button variant="ghost" size="icon" className="hidden sm:inline-flex">
            <Phone className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" className="hidden sm:inline-flex">
            <Video className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon">
            <MoreVertical className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Message List */}
      <MessageList 
        initialMessages={messages} 
        initialNextCursor={nextCursor}
        currentUserId={user.id} 
        conversationId={conversationId} 
      />

      {/* Input Area */}
      <MessageInput conversationId={conversationId} />
    </div>
  )
}
