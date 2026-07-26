"use client"

import { createContext, useContext, useEffect, useState, useRef } from "react"
import { createClient } from "@/lib/supabase/client"

interface PresenceContextType {
  onlineUsers: string[]
}

const PresenceContext = createContext<PresenceContextType>({ onlineUsers: [] })

export const usePresence = () => useContext(PresenceContext)

export function PresenceProvider({ children, currentUserId }: { children: React.ReactNode, currentUserId: string }) {
  const [onlineUsers, setOnlineUsers] = useState<string[]>([])
  const supabase = useRef(createClient()).current

  useEffect(() => {
    // Create a unique channel for global presence
    const channel = supabase.channel('global-online-users', {
      config: {
        presence: {
          key: currentUserId,
        },
      },
    })

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState()
        const users = Object.keys(state)
        setOnlineUsers(users)
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        setOnlineUsers((prev) => Array.from(new Set([...prev, key])))
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        setOnlineUsers((prev) => prev.filter(userId => userId !== key))
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          // Track the user as online once subscribed
          await channel.track({ onlineAt: new Date().toISOString() })
        }
      })

    return () => {
      supabase.removeChannel(channel)
    }
  }, [currentUserId, supabase])

  return (
    <PresenceContext.Provider value={{ onlineUsers }}>
      {children}
    </PresenceContext.Provider>
  )
}
