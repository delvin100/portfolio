'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Loader2, Trash2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { toast } from "sonner"
import { deleteCertification } from '@/app/actions/portfolio'

export function DeleteCertificationButton({ id, name }: { id: string, name: string }) {
  const [isOpen, setIsOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      await deleteCertification(id)
      toast.success("Certification deleted successfully!")
      setIsOpen(false)
    } catch (error: any) {
      toast.error(error.message || "Failed to delete certification")
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger 
        render={
          <Button 
            variant="ghost" 
            size="icon" 
            disabled={isDeleting}
            className="h-8 w-8 text-rose-400 hover:text-rose-300 hover:bg-rose-400/10"
          />
        }
      >
        <Trash2 className="h-4 w-4" />
        <span className="sr-only">Delete</span>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-md bg-[#0b1120] border-[#1e293b] shadow-2xl p-6">
        <DialogHeader className="gap-3">
          <DialogTitle className="text-xl flex items-center gap-2 text-slate-100">
            <div className="p-2 bg-rose-500/10 rounded-full">
              <Trash2 className="h-5 w-5 text-rose-400" />
            </div>
            Delete Certification
          </DialogTitle>
          <DialogDescription className="text-slate-400 text-base leading-relaxed pt-2">
            Are you sure you want to delete <strong className="text-rose-400 font-semibold">{name}</strong>? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="sm:justify-end gap-3 pt-6 border-t border-[#1e293b]/50 mt-2 bg-transparent">
          <Button
            type="button"
            variant="outline"
            className="border-white/10 bg-transparent text-slate-300 hover:bg-white/5 hover:text-white"
            onClick={() => setIsOpen(false)}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            type="button"
            className="bg-rose-600 hover:bg-rose-500 text-white shadow-lg hover:shadow-rose-500/25 transition-all"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
