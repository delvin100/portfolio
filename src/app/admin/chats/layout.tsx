import { ChatSidebar } from "@/components/chat/sidebar"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Admin Chats | Portfolio",
  description: "Admin chat management",
}

import { createClient } from "@/lib/supabase/server"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { PresenceProvider } from "@/components/chat/presence-provider"
import { ChatLayoutClient } from "@/components/chat/chat-layout-client"

const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'delvin'

export default async function AdminChatsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    redirect('/login')
  }

  // Fetch the current user for the sidebar header
  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
  })

  // Ensure user is admin
  if (dbUser?.username !== ADMIN_USERNAME) {
    redirect('/')
  }

  // Fetch and format conversations
  const { getUserConversations } = await import('@/actions/chat');
  const conversations = await getUserConversations();

  const sidebarContent = (
    <div className="hidden md:block border-r border-border/40 relative z-10 bg-background/40 backdrop-blur-md h-full w-[300px]">
      <ChatSidebar 
        initialConversations={conversations} 
        currentUser={dbUser} 
        isAdmin={true}
        adminUser={null}
      />
    </div>
  )

  return (
    <PresenceProvider currentUserId={user.id}>
      <ChatLayoutClient sidebar={sidebarContent}>
        {children}
      </ChatLayoutClient>
    </PresenceProvider>
  )
}
