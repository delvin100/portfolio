"use client"

import { useFormStatus } from 'react-dom'
import { Button } from '@/components/ui/button'
import { Sparkles } from 'lucide-react'
import { toast } from 'sonner'

export function SubmitButton({ 
  label, 
  successMessage 
}: { 
  label: string
  successMessage: string 
}) {
  const { pending } = useFormStatus()
  
  return (
    <Button 
      type="submit" 
      size="lg" 
      disabled={pending}
      onClick={(e) => {
        // Wait a tick to allow the browser to run native HTML5 validation
        setTimeout(() => {
          const btn = e.target as HTMLElement;
          const form = btn.closest('form') as HTMLFormElement;
          if (form && form.checkValidity()) {
             toast.success(successMessage)
          }
        }, 10)
      }}
      className="bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-500 hover:to-emerald-500 text-white shadow-lg hover:shadow-blue-500/25 transition-all w-full sm:w-auto text-md font-semibold"
    >
      {pending ? "Saving..." : label}
      <Sparkles className="ml-2 h-4 w-4" />
    </Button>
  )
}
