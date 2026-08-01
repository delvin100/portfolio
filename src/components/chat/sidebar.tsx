"use client"

import { useState, useEffect, useTransition, useRef } from "react"
import { Search, MessageSquare, MoreVertical, Edit, Loader2, LogOut, Settings } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { searchUsers, getUserConversations } from "@/actions/chat"
import { logout } from "@/actions/auth"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { updateUserSettings } from "@/actions/settings"
import { getInitials } from "@/lib/utils"

import { createClient } from "@/lib/supabase/client"
import { usePresence } from "@/components/chat/presence-provider"

interface ChatSidebarProps {
  initialConversations: any[]
  currentUser: any
  isAdmin?: boolean
  adminUser?: any
}

export function ChatSidebar({ initialConversations, currentUser, isAdmin = false, adminUser }: ChatSidebarProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [conversations, setConversations] = useState(initialConversations)
  
  // Settings modal state
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [isSavingSettings, startSavingSettings] = useTransition()
  const [settingsError, setSettingsError] = useState<string | null>(null)
  
  const router = useRouter()
  const { onlineUsers } = usePresence()
  
  const supabase = useRef(createClient()).current

  const handleUpdateSettings = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSettingsError(null)
    const formData = new FormData(e.currentTarget)
    startSavingSettings(async () => {
      const result = await updateUserSettings({}, formData)
      if (result.error) {
        setSettingsError(result.error)
      } else {
        setIsSettingsOpen(false)
        router.refresh()
      }
    })
  }
  
  // Listen for ANY message to update the sidebar
  useEffect(() => {
    const channel = supabase
      .channel('sidebar-messages')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'Message' },
        async (payload) => {
          // Instead of router.refresh(), fetch the updated list of conversations from the server
          // This prevents a heavy Next.js Server Components rebuild and just fetches JSON data.
          try {
            const updatedConversations = await getUserConversations()
            setConversations(updatedConversations)
          } catch (e) {
            console.error(e)
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase])

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchQuery.trim().length > 0) {
        setIsSearching(true)
        searchUsers(searchQuery).then((results) => {
          setSearchResults(results)
          setIsSearching(false)
        })
      } else {
        setSearchResults([])
      }
    }, 300)

    return () => clearTimeout(delayDebounceFn)
  }, [searchQuery])

  const handleStartChat = (username: string) => {
    startTransition(() => {
      const basePath = isAdmin ? '/admin/chats' : '/chat'
      router.push(`${basePath}/${username}`)
      setSearchQuery("")
    })
  }

  return (
    <div className="w-full flex flex-col h-full bg-transparent">
      {/* Header */}
      <div className="p-4 border-b border-border/40 flex items-center justify-between bg-black/10">
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8 ring-1 ring-border/50">
            <AvatarImage src={currentUser?.profileImage || ""} />
            <AvatarFallback>{getInitials(currentUser?.name)}</AvatarFallback>
          </Avatar>
          <span className="font-semibold">{currentUser?.name || "My Chats"}</span>
        </div>
        <div className="flex items-center gap-1.5 bg-black/10 dark:bg-white/5 p-1 rounded-full border border-black/5 dark:border-white/5 shadow-inner backdrop-blur-md">
          <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
            <DialogTrigger render={
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 rounded-full hover:bg-transparent text-muted-foreground hover:text-foreground transition-colors"
                title="Edit Profile"
              />
            }>
              <Edit className="h-4 w-4" strokeWidth={2.5} />
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] bg-background/95 backdrop-blur-xl border-white/10">
              <DialogHeader>
                <DialogTitle>Edit Profile</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleUpdateSettings} className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input 
                    id="name" 
                    name="name" 
                    defaultValue={currentUser?.name || ""} 
                    required 
                    className="bg-black/10 border-white/10"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input 
                    id="username" 
                    name="username" 
                    defaultValue={currentUser?.username || ""} 
                    required 
                    className="bg-black/10 border-white/10"
                  />
                </div>
                
                {settingsError && (
                  <div className="text-sm text-destructive">{settingsError}</div>
                )}
                
                <DialogFooter className="pt-4">
                  <DialogClose render={<Button type="button" variant="ghost" />}>
                    Cancel
                  </DialogClose>
                  <Button type="submit" disabled={isSavingSettings}>
                    {isSavingSettings && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save Changes
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
          {!isAdmin && (
            <>
              <div className="w-px h-4 bg-border/50 mx-0.5"></div>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 rounded-full hover:bg-transparent text-muted-foreground hover:text-red-500 transition-colors"
                onClick={() => startTransition(() => { logout() })}
                title="Logout"
              >
                <LogOut className="h-4 w-4" strokeWidth={2.5} />
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Search */}
      {isAdmin && (
        <div className="p-3 border-b border-border/40 bg-black/5">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search for users..."
              className="pl-9 bg-black/20 border-white/5 rounded-xl shadow-inner focus-visible:ring-1 focus-visible:ring-primary/30 transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      )}

      {/* Conversation / Search Results List */}
      <div className="flex-1 overflow-y-auto">
        {searchQuery.length > 0 ? (
          // Search Results View
          <div className="py-2">
            <div className="px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Search Results
            </div>
            {isSearching ? (
              <div className="flex items-center justify-center p-4">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            ) : searchResults.length === 0 ? (
              <div className="p-4 text-center text-sm text-muted-foreground">
                No users found.
              </div>
            ) : (
              searchResults.map((user) => (
                <div
                  key={user.id}
                  onClick={() => handleStartChat(user.username)}
                  className="flex items-center gap-3 p-3 hover:bg-white/5 cursor-pointer transition-all border-b border-border/20 m-1 rounded-lg"
                >
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={user.profileImage || ""} />
                    <AvatarFallback>{getInitials(user.name || user.username)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{user.name}</p>
                    <p className="text-sm text-muted-foreground truncate">@{user.username}</p>
                  </div>
                  {isPending && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
                </div>
              ))
            )}
          </div>
        ) : (
          // Normal Conversation List View
          conversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-4 text-center space-y-3">
              <MessageSquare className="h-10 w-10 opacity-20" />
              <p>No conversations yet.</p>
              {isAdmin ? (
                <p className="text-sm">Search for a user to start chatting!</p>
              ) : (
                <div className="flex flex-col items-center gap-2 mt-2">
                  <p className="text-sm mb-2">Start a conversation with the admin!</p>
                  {adminUser && (
                    <Button 
                      onClick={() => handleStartChat(adminUser.username)}
                      disabled={isPending}
                    >
                      {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <MessageSquare className="mr-2 h-4 w-4" />}
                      Message {adminUser.name}
                    </Button>
                  )}
                </div>
              )}
            </div>
          ) : (
            conversations.map((chat) => (
              <div
                key={chat.id}
                onClick={() => {
                  const basePath = isAdmin ? '/admin/chats' : '/chat'
                  router.push(`${basePath}/${chat.username}`)
                }}
                className="flex items-center gap-3 p-3 hover:bg-white/5 cursor-pointer transition-all border-b border-border/20 m-1 rounded-lg"
              >
                <div className="relative">
                  <Avatar className="h-12 w-12 shrink-0">
                    <AvatarFallback>{getInitials(chat.name)}</AvatarFallback>
                  </Avatar>
                  {onlineUsers.includes(chat.otherUserId) && (
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-background rounded-full transition-all duration-300 scale-100"></span>
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold truncate">{chat.name}</span>
                    <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">{chat.time}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground truncate">{chat.lastMessage}</p>
                    {chat.unread > 0 && (
                      <span className="bg-primary text-primary-foreground text-[10px] font-bold px-2 py-0.5 rounded-full ml-2">
                        {chat.unread}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))
          )
        )}
      </div>
    </div>
  )
}
