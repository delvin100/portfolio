'use client'

import { useState, useEffect } from "react"
import { Reorder, useDragControls } from "framer-motion"
import { Button, buttonVariants } from "@/components/ui/button"
import { Save, GripVertical, Pencil, Trash2 } from "lucide-react"
import Link from "next/link"
import { updateCertificationsOrder, deleteCertifications } from "@/app/actions/portfolio"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { DeleteCertificationButton } from "./delete-certification-button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

type Certification = {
  id: string
  name: string
  issuer: string
  date: string | null
  description?: string | null
  linkedin_url?: string | null
  order_index: number
}

function CertificationItem({ 
  cert, 
  isSelectionMode,
  isSelected,
  onToggleSelect 
}: { 
  cert: Certification
  isSelectionMode: boolean
  isSelected: boolean
  onToggleSelect: (id: string) => void
}) {
  const controls = useDragControls()

  return (
    <Reorder.Item 
      value={cert} 
      id={cert.id}
      as="tr"
      dragListener={false} 
      dragControls={controls}
      className="hover:bg-white/[0.02] transition-colors border-b border-white/5 group relative bg-transparent select-none"
    >
      <td className="relative px-4 py-4 text-center font-medium text-slate-200 align-middle">
        <div 
          className="absolute left-0 sm:left-2 top-1/2 -translate-y-1/2 cursor-grab active:cursor-grabbing text-slate-500 hover:text-slate-300 p-3 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity touch-none"
          onPointerDown={(e) => {
            if (!isSelectionMode) {
              e.preventDefault()
              controls.start(e)
            }
          }}
        >
          {!isSelectionMode && <GripVertical className="h-4 w-4" />}
        </div>
        <div className="flex items-center justify-center gap-3 ml-8">
          {isSelectionMode && (
            <Checkbox 
              checked={isSelected}
              onCheckedChange={() => onToggleSelect(cert.id)}
              className="border-slate-500"
            />
          )}
          {cert.name}
        </div>
      </td>
      <td className="px-4 py-4 text-center align-middle text-slate-300">
        {cert.issuer}
      </td>
      <td className="px-4 py-4 text-center align-middle text-slate-300">
        {cert.date ? new Date(cert.date).toLocaleDateString('en-US', { timeZone: 'UTC', year: 'numeric', month: 'long', day: 'numeric' }) : 'No Date'}
      </td>
      <td className="px-4 py-4 text-center align-middle">
        <div className="flex justify-center items-center gap-1">
          {!isSelectionMode && (
            <>
              <Link href={`/admin/certifications/${cert.id}`} className={buttonVariants({ variant: "ghost", size: "icon", className: "h-8 w-8 text-blue-400 hover:text-blue-300 hover:bg-blue-400/10" })}>
                <Pencil className="h-4 w-4" />
                <span className="sr-only">Edit</span>
              </Link>
              <DeleteCertificationButton id={cert.id} name={cert.name} />
            </>
          )}
        </div>
      </td>
    </Reorder.Item>
  )
}

export function CertificationsDndList({ initialCerts }: { initialCerts: Certification[] }) {
  const [certs, setCerts] = useState<Certification[]>(initialCerts)
  
  useEffect(() => {
    setCerts(initialCerts)
  }, [initialCerts])

  const [isSaving, setIsSaving] = useState(false)
  const [isSelectionMode, setIsSelectionMode] = useState(false)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [isDeletingBulk, setIsDeletingBulk] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  
  const router = useRouter()

  const handleSaveOrder = async () => {
    setIsSaving(true)
    
    try {
      const updates = certs.map((c, index) => ({
        id: c.id,
        order_index: index + 1
      }))

      await updateCertificationsOrder(updates)
      toast.success("Order Saved!")
      router.refresh()
    } catch (error: any) {
      toast.error("Failed to save order", {
        description: error.message,
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleToggleSelect = (id: string) => {
    const next = new Set(selectedIds)
    if (next.has(id)) {
      next.delete(id)
    } else {
      next.add(id)
    }
    setSelectedIds(next)
  }

  const handleToggleSelectionMode = () => {
    setIsSelectionMode(!isSelectionMode)
    setSelectedIds(new Set())
  }

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return
    
    setIsDeletingBulk(true)
    try {
      await deleteCertifications(Array.from(selectedIds))
      toast.success(`${selectedIds.size} item(s) deleted successfully`)
      
      setCerts(prev => prev.filter(e => !selectedIds.has(e.id)))
      setIsSelectionMode(false)
      setSelectedIds(new Set())
      setIsDeleteDialogOpen(false)
    } catch (error: any) {
      toast.error("Failed to delete", {
        description: error.message,
      })
    } finally {
      setIsDeletingBulk(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-primary/5 border border-primary/20 rounded-xl p-4">
        <div className="flex flex-col gap-2">
          <div>
            <h3 className="font-semibold text-primary">Interactive Layout Editor</h3>
            <p className="text-sm text-muted-foreground mt-1">Drag the handles (⋮⋮) to reorder your certifications.</p>
          </div>
          <div className="flex items-center gap-2 mt-2">
            <Checkbox 
              id="selection-mode" 
              checked={isSelectionMode} 
              onCheckedChange={handleToggleSelectionMode} 
            />
            <label htmlFor="selection-mode" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer">
              Enable Selection Mode
            </label>
          </div>
        </div>
        
        <div className="flex gap-2">
          {isSelectionMode && selectedIds.size > 0 && (
            <Button 
              variant="destructive" 
              onClick={() => setIsDeleteDialogOpen(true)}
              className="w-full sm:w-auto"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Selected ({selectedIds.size})
            </Button>
          )}
          
          <Button 
            onClick={handleSaveOrder} 
            disabled={isSaving || isSelectionMode}
            className="bg-primary text-primary-foreground shadow-lg hover:shadow-primary/25 transition-all"
          >
            {isSaving ? "Saving..." : (
              <>
                <Save className="h-4 w-4" />
                Save Layout Order
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="rounded-xl border border-white/10 bg-black/20 backdrop-blur-sm overflow-x-auto relative">
        <table className="w-full text-sm">
          <thead className="bg-black/40 border-b border-white/10">
            <tr>
              <th className="h-12 px-4 pl-12 text-center font-semibold text-slate-300 w-1/3">Name</th>
              <th className="h-12 px-4 text-center font-semibold text-slate-300 w-1/3">Issuer</th>
              <th className="h-12 px-4 text-center font-semibold text-slate-300 w-1/6">Date</th>
              <th className="h-12 px-4 text-center font-semibold text-slate-300 w-[100px]">Actions</th>
            </tr>
          </thead>
          <Reorder.Group 
            as="tbody" 
            axis="y" 
            values={certs} 
            onReorder={setCerts}
            className="[&_tr:last-child]:border-0"
          >
            {certs.length === 0 ? (
              <tr>
                <td colSpan={4} className="h-32 text-center text-muted-foreground">
                  No certifications found. Add one above!
                </td>
              </tr>
            ) : (
              certs.map((c) => (
                <CertificationItem 
                  key={c.id} 
                  cert={c} 
                  isSelectionMode={isSelectionMode}
                  isSelected={selectedIds.has(c.id)}
                  onToggleSelect={handleToggleSelect}
                />
              ))
            )}
          </Reorder.Group>
        </table>
      </div>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md bg-[#0b1120] border-[#1e293b] shadow-2xl p-6">
          <DialogHeader className="gap-3">
            <DialogTitle className="text-xl flex items-center gap-2 text-slate-100">
              <div className="p-2 bg-rose-500/10 rounded-full">
                <Trash2 className="h-5 w-5 text-rose-400" />
              </div>
              Delete Certifications
            </DialogTitle>
            <DialogDescription className="text-slate-400 text-base leading-relaxed pt-2">
              Are you sure you want to delete {selectedIds.size} certification(s)? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-end gap-3 pt-6 border-t border-[#1e293b]/50 mt-2 bg-transparent">
            <Button
              type="button"
              variant="outline"
              className="border-white/10 bg-transparent text-slate-300 hover:bg-white/5 hover:text-white"
              onClick={() => setIsDeleteDialogOpen(false)}
              disabled={isDeletingBulk}
            >
              Cancel
            </Button>
            <Button
              type="button"
              className="bg-rose-600 hover:bg-rose-500 text-white shadow-lg hover:shadow-rose-500/25 transition-all"
              onClick={handleBulkDelete}
              disabled={isDeletingBulk}
            >
              {isDeletingBulk ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
