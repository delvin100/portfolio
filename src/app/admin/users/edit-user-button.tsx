'use client'

import { useState } from 'react'
import { Pencil, Loader2 } from 'lucide-react'
import { updateUser } from '@/app/actions/admin'
import { toast } from 'sonner'
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogClose
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export function EditUserButton({ userId, initialName, initialUsername }: { userId: string, initialName: string, initialUsername: string }) {
  const [isUpdating, setIsUpdating] = useState(false)
  const [open, setOpen] = useState(false)
  const [name, setName] = useState(initialName)
  const [username, setUsername] = useState(initialUsername)

  const handleUpdate = async () => {
    setIsUpdating(true)
    const result = await updateUser(userId, { name, username })
    if (result?.error) {
      toast.error(result.error)
      setIsUpdating(false)
    } else {
      toast.success("User updated successfully")
      setOpen(false)
      setIsUpdating(false)
    }
  }

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setName(initialName)
      setUsername(initialUsername)
    }
    setOpen(newOpen)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger 
        render={
          <button 
            disabled={isUpdating}
            className="text-blue-500 hover:text-blue-400 transition-colors p-2 rounded-full hover:bg-blue-500/20 inline-flex items-center justify-center disabled:opacity-50"
            title="Edit user"
          />
        }
      >
        {isUpdating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Pencil className="w-5 h-5" />}
      </DialogTrigger>
      
      <DialogContent showCloseButton={true} className="sm:max-w-md bg-[#0f172a] border-slate-800 text-white p-0 overflow-hidden rounded-xl">
        <div className="p-6 pb-4">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 text-xl font-semibold text-white">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-500/10">
                <Pencil className="h-5 w-5 text-blue-500" />
              </div>
              Edit User
            </DialogTitle>
            <DialogDescription className="text-slate-300 mt-2 text-base">
              Update details for <span className="font-medium text-white">{initialName}</span>.
            </DialogDescription>
          </DialogHeader>
        </div>
        
        <div className="px-6 py-2 space-y-4">
          <div className="space-y-2">
            <Label htmlFor={`name-${userId}`} className="text-slate-300">Name</Label>
            <Input 
              id={`name-${userId}`} 
              value={name} 
              onChange={(e) => setName(e.target.value)}
              className="bg-slate-900 border-slate-700 text-white placeholder:text-slate-500 focus-visible:ring-blue-500"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor={`username-${userId}`} className="text-slate-300">Username</Label>
            <Input 
              id={`username-${userId}`} 
              value={username} 
              onChange={(e) => setUsername(e.target.value)}
              className="bg-slate-900 border-slate-700 text-white placeholder:text-slate-500 focus-visible:ring-blue-500"
            />
          </div>
        </div>

        <div className="border-t border-slate-800 p-4 mt-4 flex justify-end gap-3 bg-[#0f172a]">
          <DialogClose 
            render={
              <Button className="bg-slate-800 hover:bg-slate-700 text-white border-0" />
            }
          >
            Cancel
          </DialogClose>
          <Button 
            onClick={handleUpdate} 
            disabled={isUpdating || !name.trim() || !username.trim()}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium border-0"
          >
            {isUpdating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Changes'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
