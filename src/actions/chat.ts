'use server'

import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'

export async function searchUsers(query: string) {
  if (!query || query.trim().length === 0) {
    return []
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error("Unauthorized")
  }

  const users = await prisma.user.findMany({
    where: {
      username: {
        contains: query,
        mode: 'insensitive',
      },
      id: {
        not: user.id // Exclude current user
      }
    },
    select: {
      id: true,
      name: true,
      username: true,
      profileImage: true,
    },
    take: 10,
  })

  return users
}

export async function startConversation(targetUserId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error("Unauthorized")
  }

  // 1. Check if a direct conversation already exists between these two users
  const existingConversations = await prisma.conversation.findMany({
    where: {
      isGroup: false,
      members: {
        some: {
          userId: user.id
        }
      }
    },
    include: {
      members: true
    }
  })

  // Filter to make sure we get exactly the conversation with just these two members
  const directConversation = existingConversations.find(conv => 
    conv.members.length === 2 && 
    conv.members.some(m => m.userId === targetUserId)
  )

  if (directConversation) {
    return directConversation.id
  }

  // 2. Create a new conversation if one doesn't exist
  const newConversation = await prisma.conversation.create({
    data: {
      isGroup: false,
      members: {
        create: [
          { userId: user.id, role: 'ADMIN' },
          { userId: targetUserId, role: 'MEMBER' }
        ]
      }
    }
  })

  return newConversation.id
}

export async function getConversationDetails(conversationId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error("Unauthorized")
  }

  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
    include: {
      members: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              username: true,
              profileImage: true,
              status: true,
              lastSeen: true,
            }
          }
        }
      }
    }
  })

  if (!conversation) {
    return null;
  }

  // Ensure current user is part of this conversation
  const isMember = conversation.members.some(m => m.userId === user.id)
  if (!isMember) {
    throw new Error("Unauthorized")
  }

  // Find the other user in a 1-on-1 chat
  const otherMember = conversation.members.find(m => m.userId !== user.id)
  return {
    conversation,
    otherUser: otherMember?.user || null
  }
}

export async function getMessages(conversationId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error("Unauthorized")
  }

  const messages = await prisma.message.findMany({
    where: { conversationId },
    orderBy: { createdAt: 'asc' },
    include: {
      sender: {
        select: {
          id: true,
          name: true,
          profileImage: true
        }
      }
    }
  })

  return messages
}

export async function sendMessage(conversationId: string, content: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error("Unauthorized")
  }
  
  if (!content || content.trim().length === 0) {
    return null;
  }

  const message = await prisma.message.create({
    data: {
      content: content.trim(),
      conversationId,
      senderId: user.id,
    }
  })

  return message
}
