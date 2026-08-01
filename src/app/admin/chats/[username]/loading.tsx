import { Loader2 } from "lucide-react"

export default function ChatLoading() {
  return (
    <div className="flex flex-col h-full items-center justify-center bg-background md:rounded-r-2xl border-l border-border/40">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      <p className="mt-4 text-sm text-muted-foreground">Loading chat...</p>
    </div>
  )
}
