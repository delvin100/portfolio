import { MessageSquare } from "lucide-react"

export default function ChatEmptyState() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center bg-muted/10 h-full p-8 text-center">
      <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mb-6">
        <MessageSquare className="h-12 w-12 text-primary" />
      </div>
      <h2 className="text-2xl font-semibold mb-2">Supabase Realtime Chat</h2>
      <p className="text-muted-foreground max-w-sm">
        Select a conversation from the sidebar to start messaging, or start a new chat.
      </p>
    </div>
  )
}
