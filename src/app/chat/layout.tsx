import { ChatSidebar } from "@/components/chat/sidebar"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Chat | Portfolio",
  description: "Real-time chat application",
}

import { createClient } from "@/lib/supabase/server"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"

export default async function ChatLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    redirect('/chat-login')
  }

  // Fetch conversations for the current user
  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    include: {
      conversations: {
        include: {
          conversation: {
            include: {
              messages: {
                orderBy: { createdAt: 'desc' },
                take: 1
              },
              members: {
                where: { userId: { not: user.id } },
                include: { user: true }
              }
            }
          }
        }
      }
    }
  })

  // Format conversations for the Sidebar UI
  const conversations = dbUser?.conversations.map(member => {
    const conv = member.conversation
    const lastMessage = conv.messages[0]
    const otherUser = conv.members[0]?.user
    return {
      id: conv.id,
      name: conv.name || otherUser?.name || "Private Chat",
      lastMessage: lastMessage ? lastMessage.content : "No messages yet",
      time: lastMessage ? new Date(lastMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "",
      unread: 0, // Implement real unread count later
      online: false, // Implement real-time presence later
    }
  }) || []

  return (
    <div className="flex w-full h-[calc(100vh-4rem)] max-w-7xl mx-auto border rounded-xl overflow-hidden shadow-sm my-4">
      {/* Sidebar - hidden on small screens when a chat is open (can be improved with state later) */}
      <div className="hidden md:block">
        <ChatSidebar initialConversations={conversations} currentUser={dbUser} />
      </div>
      
      {/* Main Chat Area */}
      <div className="flex-1 bg-background flex flex-col relative">
        {children}
      </div>
    </div>
  )
}
