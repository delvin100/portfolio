import { MessageList } from "@/components/chat/message-list"
import { MessageInput } from "@/components/chat/message-input"
import { ChatHeader } from "@/components/chat/chat-header"
import { getConversationDetails, getMessages, startConversation } from "@/actions/chat"
import { getAuthUser } from "@/lib/supabase/server"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"

const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'delvin'

export default async function AdminChatWindow(props: { params: Promise<{ username: string }> }) {
  const params = await props.params;
  const { data: { user } } = await getAuthUser()

  if (!user) {
    redirect('/login')
  }

  const dbUser = await prisma.user.findUnique({ where: { id: user.id } })
  const isAdmin = dbUser?.username === ADMIN_USERNAME

  if (!isAdmin) {
    redirect('/')
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
    <div className="flex flex-col h-full bg-background md:rounded-r-2xl border-l border-border/40">
      {/* Chat Header */}
      <ChatHeader 
        otherUser={{
          id: otherUser!.id,
          name: otherUser!.name,
          username: otherUser!.username,
          profileImage: otherUser!.profileImage,
          status: otherUser!.status,
        }} 
        isAdmin={true}
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
