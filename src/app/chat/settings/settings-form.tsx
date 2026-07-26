"use client"

import { useState, useTransition } from "react"
import { updateUserSettings } from "@/actions/settings"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, AlertCircle, CheckCircle2, User, KeyRound, ShieldCheck } from "lucide-react"

interface SettingsFormProps {
  initialName: string
  initialUsername: string
}

export function SettingsForm({ initialName, initialUsername }: SettingsFormProps) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    const formData = new FormData(e.currentTarget)
    const currentPassword = formData.get("currentPassword") as string
    const newPassword = formData.get("newPassword") as string
    const confirmPassword = formData.get("confirmPassword") as string

    if (currentPassword || newPassword || confirmPassword) {
      if (!currentPassword) {
        setError("Please enter your current password to make security changes.")
        return
      }
      if (!newPassword) {
        setError("Please enter a new password.")
        return
      }
      if (newPassword.length < 6) {
        setError("New password must be at least 6 characters long.")
        return
      }
      if (newPassword !== confirmPassword) {
        setError("New password and confirm password do not match.")
        return
      }
    }

    startTransition(async () => {
      try {
        const result = await updateUserSettings({}, formData)
        if (result.error) {
          setError(result.error)
        } else if (result.success) {
          setSuccess(result.success)
          // Reset password fields
          const form = e.target as HTMLFormElement
          form.currentPassword.value = ""
          form.newPassword.value = ""
          form.confirmPassword.value = ""
        }
      } catch (err) {
        setError("An unexpected error occurred. Please try again.")
      }
    })
  }

  return (
    <div className="bg-card/40 backdrop-blur-2xl rounded-3xl border border-white/10 shadow-2xl overflow-hidden relative">
      {/* Decorative gradient blob */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl -z-10 pointer-events-none translate-x-1/3 -translate-y-1/3" />
      
      <form onSubmit={handleSubmit} className="p-6 sm:p-10 space-y-10 relative z-10">
        
        {/* Profile Section */}
        <div className="space-y-6">
          <div className="flex items-center gap-3 border-b border-white/5 pb-4">
            <div className="p-2.5 bg-indigo-500/10 rounded-xl text-indigo-400 shrink-0 border border-indigo-500/20">
              <User className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-semibold tracking-tight text-white/90">Profile Information</h2>
              <p className="text-sm text-muted-foreground">Update your display name and unique username.</p>
            </div>
          </div>
          
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-2.5 group">
              <Label htmlFor="name" className="text-white/70 group-focus-within:text-indigo-400 transition-colors">Display Name</Label>
              <Input 
                id="name" 
                name="name" 
                defaultValue={initialName} 
                placeholder="Enter your display name"
                required 
                className="h-12 bg-black/20 border-white/10 hover:border-white/20 focus-visible:border-indigo-500/50 focus-visible:ring-2 focus-visible:ring-indigo-500/20 focus-visible:bg-black/30 transition-all rounded-xl text-base px-4 placeholder:text-white/30"
              />
            </div>
            
            <div className="space-y-2.5 group">
              <Label htmlFor="username" className="text-white/70 group-focus-within:text-indigo-400 transition-colors">Username</Label>
              <Input 
                id="username" 
                name="username" 
                defaultValue={initialUsername} 
                placeholder="Choose a unique username"
                required 
                className="h-12 bg-black/20 border-white/10 hover:border-white/20 focus-visible:border-indigo-500/50 focus-visible:ring-2 focus-visible:ring-indigo-500/20 focus-visible:bg-black/30 transition-all rounded-xl text-base px-4 placeholder:text-white/30"
              />
            </div>
          </div>
        </div>

        {/* Security Section */}
        <div className="space-y-6 pt-4">
          <div className="flex items-center gap-3 border-b border-white/5 pb-4">
            <div className="p-2.5 bg-rose-500/10 rounded-xl text-rose-400 shrink-0 border border-rose-500/20">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-semibold tracking-tight text-white/90">Security</h2>
              <p className="text-sm text-muted-foreground">Change your password. Leave blank if you don't want to change it.</p>
            </div>
          </div>
          
          <div className="space-y-6 relative">
            
            <div className="space-y-2.5 group relative">
              <Label htmlFor="currentPassword" className="text-white/70 group-focus-within:text-rose-400 transition-colors flex items-center gap-2">
                <KeyRound className="h-3.5 w-3.5 opacity-50 group-focus-within:opacity-100 transition-opacity" />
                Current Password
              </Label>
              <Input 
                id="currentPassword" 
                name="currentPassword" 
                type="password" 
                placeholder="Enter your current password"
                className="h-12 bg-black/20 border-white/10 hover:border-white/20 focus-visible:border-rose-500/50 focus-visible:ring-2 focus-visible:ring-rose-500/20 focus-visible:bg-black/30 transition-all rounded-xl text-base px-4 placeholder:text-white/30"
              />
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-2.5 group relative">
                <Label htmlFor="newPassword" className="text-white/70 group-focus-within:text-rose-400 transition-colors flex items-center gap-2">
                  <KeyRound className="h-3.5 w-3.5 opacity-50 group-focus-within:opacity-100 transition-opacity" />
                  New Password
                </Label>
                <Input 
                  id="newPassword" 
                  name="newPassword" 
                  type="password" 
                  placeholder="Enter a new password"
                  className="h-12 bg-black/20 border-white/10 hover:border-white/20 focus-visible:border-rose-500/50 focus-visible:ring-2 focus-visible:ring-rose-500/20 focus-visible:bg-black/30 transition-all rounded-xl text-base px-4 placeholder:text-white/30"
                />
              </div>

              <div className="space-y-2.5 group relative">
                <Label htmlFor="confirmPassword" className="text-white/70 group-focus-within:text-rose-400 transition-colors flex items-center gap-2">
                  <KeyRound className="h-3.5 w-3.5 opacity-50 group-focus-within:opacity-100 transition-opacity" />
                  Confirm New Password
                </Label>
                <Input 
                  id="confirmPassword" 
                  name="confirmPassword" 
                  type="password" 
                  placeholder="Repeat your new password"
                  className="h-12 bg-black/20 border-white/10 hover:border-white/20 focus-visible:border-rose-500/50 focus-visible:ring-2 focus-visible:ring-rose-500/20 focus-visible:bg-black/30 transition-all rounded-xl text-base px-4 placeholder:text-white/30"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Alerts */}
        {error && (
          <div className="bg-destructive/10 text-destructive border border-destructive/20 text-sm px-4 py-3 rounded-lg flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <p>{error}</p>
          </div>
        )}
        
        {success && (
          <div className="bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 text-sm px-4 py-3 rounded-lg flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <p>{success}</p>
          </div>
        )}

        {/* Actions */}
        <div className="pt-8 flex justify-end">
          <Button 
            type="submit" 
            disabled={isPending}
            className="w-full sm:w-auto h-12 px-8 rounded-xl bg-gradient-to-r from-indigo-500 via-indigo-600 to-indigo-700 hover:from-indigo-400 hover:via-indigo-500 hover:to-indigo-600 text-white font-medium shadow-lg shadow-indigo-900/30 transition-all duration-300 hover:scale-[1.03] active:scale-95 border border-indigo-400/20"
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Saving Changes...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </div>

      </form>
    </div>
  )
}
