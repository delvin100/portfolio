import { createClient } from "@/lib/supabase/server"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { SettingsForm } from "./settings-form"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/chat-login')
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id }
  })

  if (!dbUser) {
    redirect('/chat-login')
  }

  return (
    <div className="flex flex-col h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/20 via-background to-background overflow-y-auto">
      <div className="flex-1 p-6 md:p-10 max-w-3xl mx-auto w-full pt-12">
        
        <div className="mb-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <Link href="/chat" className="group inline-flex items-center text-sm font-medium text-muted-foreground hover:text-indigo-400 transition-colors mb-6 bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-full border border-white/5">
            <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
            Back to Chat
          </Link>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60 mb-3">
            Account Settings
          </h1>
          <p className="text-muted-foreground/80 text-lg">Manage your profile, security preferences, and personal details.</p>
        </div>

        <div className="animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-150 fill-mode-both">
          <SettingsForm initialName={dbUser.name} initialUsername={dbUser.username} />
        </div>
        
      </div>
    </div>
  )
}
