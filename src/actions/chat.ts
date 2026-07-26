'use server'

import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'

const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'delvin'

export async function getAdminUser() {
  return await prisma.user.findUnique({
    where: { username: ADMIN_USERNAME }
  })
}

export async function searchUsers(query: string) {
  if (!query || query.trim().length === 0) {
    return []
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error("Unauthorized")
  }

  let dbUser = await prisma.user.findUnique({ where: { id: user.id } })
  
  if (!dbUser) {
    // Self-heal: Create user if they exist in Supabase but not Prisma
    const defaultUsername = user.email ? user.email.split('@')[0] : `user_${user.id.substring(0, 5)}`
    dbUser = await prisma.user.create({
      data: {
        id: user.id,
        name: defaultUsername,
        username: defaultUsername,
        status: 'Online'
      }
    })
  }
  
  if (dbUser.username !== ADMIN_USERNAME) {
    return [] // Non-admins cannot search
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

  let dbUser = await prisma.user.findUnique({ where: { id: user.id } })
  
  if (!dbUser) {
    // Self-heal: Create user if they exist in Supabase but not Prisma
    const defaultUsername = user.email ? user.email.split('@')[0] : `user_${user.id.substring(0, 5)}`
    dbUser = await prisma.user.create({
      data: {
        id: user.id,
        name: defaultUsername,
        username: defaultUsername,
        status: 'Online'
      }
    })
  }

  const isAdmin = dbUser.username === ADMIN_USERNAME

  // If not admin, they can ONLY start a conversation with the admin
  if (!isAdmin) {
    const adminUser = await getAdminUser()
    if (!adminUser) throw new Error("Admin user not found")
    if (targetUserId !== adminUser.id) {
      throw new Error("Regular users can only chat with the admin")
    }
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

export async function getMessages(conversationId: string, cursor?: string, limit: number = 50) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error("Unauthorized")
  }

  const messages = await prisma.message.findMany({
    where: { conversationId },
    orderBy: { createdAt: 'desc' },
    take: limit + 1,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    include: {
      sender: {
        select: {
          id: true,
          name: true,
          profileImage: true
        }
      },
      attachments: true
    }
  })

  let nextCursor: string | undefined = undefined;
  if (messages.length > limit) {
    const nextItem = messages.pop()
    nextCursor = nextItem!.id
  }

  return {
    messages: messages.reverse(),
    nextCursor
  }
}

export async function sendMessage(
  conversationId: string, 
  content: string,
  attachments?: { url: string; fileType: string; name: string }[]
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error("Unauthorized")
  }
  
  if ((!content || content.trim().length === 0) && (!attachments || attachments.length === 0)) {
    return null;
  }

  const message = await prisma.message.create({
    data: {
      content: content ? content.trim() : "",
      conversationId,
      senderId: user.id,
      attachments: attachments?.length ? {
        create: attachments
      } : undefined
    },
    include: {
      attachments: true
    }
  })

  return message
}

export async function getUserConversations() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return []

  let dbUser = await prisma.user.findUnique({
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

  if (!dbUser) {
    const defaultUsername = user.email ? user.email.split('@')[0] : `user_${user.id.substring(0, 5)}`
    await prisma.user.create({
      data: {
        id: user.id,
        name: defaultUsername,
        username: defaultUsername,
        status: 'Online'
      }
    })
    return [] // Return empty conversations for newly created user
  }

  const conversations = (dbUser?.conversations || [])
    .filter(member => member.conversation.messages.length > 0)
    .map(member => {
      const conv = member.conversation
      const lastMessage = conv.messages[0]
      const otherUser = conv.members[0]?.user
      return {
        id: conv.id,
        otherUserId: otherUser?.id,
        name: conv.name || otherUser?.name || "Private Chat",
        username: otherUser?.username || "unknown",
        lastMessage: lastMessage.content,
        time: new Date(lastMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        unread: 0,
        online: otherUser?.status === "Online",
      }
    })

  // Sort conversations by latest message time
  conversations.sort((a, b) => {
    const timeA = dbUser?.conversations.find(c => c.conversationId === a.id)?.conversation.messages[0]?.createdAt.getTime() || 0;
    const timeB = dbUser?.conversations.find(c => c.conversationId === b.id)?.conversation.messages[0]?.createdAt.getTime() || 0;
    return timeB - timeA;
  });

  // Deduplicate conversations by otherUserId (keep the most recent one)
  const uniqueConversations = [];
  const seenUserIds = new Set();
  
  for (const conv of conversations) {
    if (conv.otherUserId) {
      if (!seenUserIds.has(conv.otherUserId)) {
        seenUserIds.add(conv.otherUserId);
        uniqueConversations.push(conv);
      }
    } else {
      uniqueConversations.push(conv);
    }
  }

  return uniqueConversations;
}
