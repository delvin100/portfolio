import { MessageList } from "@/components/chat/message-list"
import { MessageInput } from "@/components/chat/message-input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { ChatHeader } from "@/components/chat/chat-header"
import { logout } from "@/actions/auth"
import { getConversationDetails, getMessages, startConversation } from "@/actions/chat"
import { getAuthUser } from "@/lib/supabase/server"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { use } from "react"

export default async function ChatWindow(props: { params: Promise<{ username: string }> }) {
  const params = await props.params;
  const { data: { user } } = await getAuthUser()

  if (!user) {
    redirect('/chat-login')
  }
  
  const targetUsername = params.username
  const targetUser = await prisma.user.findUnique({ where: { username: targetUsername } })
  
  if (!targetUser) {
    return <div className="flex items-center justify-center h-full">User not found.</div>
  }
  
  const conversationId = await startConversation(targetUser.id)
  const details = await getConversationDetails(conversationId)
  
  if (!details) {
    return <div className="flex items-center justify-center h-full">Conversation not found.</div>
  }
  
  const { messages, nextCursor } = await getMessages(conversationId)
  const { otherUser } = details

  return (
    <div className="flex flex-col h-full">
      {/* Chat Header */}
      <ChatHeader 
        otherUser={{
          id: otherUser!.id,
          name: otherUser!.name,
          username: otherUser!.username,
          profileImage: otherUser!.profileImage,
          status: otherUser!.status,
        }} 
      />

      {/* Message List */}
      <MessageList 
        initialMessages={messages} 
        initialNextCursor={nextCursor}
        currentUserId={user.id} 
        conversationId={conversationId} 
      />

      {/* Input Area */}
      <MessageInput conversationId={conversationId} currentUserId={user.id} />
    </div>
  )
}
