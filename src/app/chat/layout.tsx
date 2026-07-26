import { ChatSidebar } from "@/components/chat/sidebar"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Chat | Portfolio",
  description: "Real-time chat application",
}

import { createClient } from "@/lib/supabase/server"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { getAdminUser } from "@/actions/chat"
import { PresenceProvider } from "@/components/chat/presence-provider"
import { ChatLayoutClient } from "@/components/chat/chat-layout-client"

const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'delvin'

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

  // Fetch the current user for the sidebar header
  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
  })

  // Fetch and format conversations using the shared server action (which handles filtering)
  const { getUserConversations } = await import('@/actions/chat');
  const conversations = await getUserConversations();

  const isAdmin = dbUser?.username === ADMIN_USERNAME;
  const adminUser = !isAdmin ? await getAdminUser() : null;

  const sidebarContent = isAdmin ? (
    <div className="hidden md:block border-r border-border/40 relative z-10 bg-background/40 backdrop-blur-md h-full">
      <ChatSidebar 
        initialConversations={conversations} 
        currentUser={dbUser} 
        isAdmin={isAdmin}
        adminUser={adminUser}
      />
    </div>
  ) : null

  return (
    <PresenceProvider currentUserId={user.id}>
      <ChatLayoutClient sidebar={sidebarContent}>
        {children}
      </ChatLayoutClient>
    </PresenceProvider>
  )
}
