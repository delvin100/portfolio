"use client"

import { useState, useEffect } from "react"
import { Reorder, useDragControls } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button, buttonVariants } from "@/components/ui/button"
import { Save, GripVertical, Pencil, Trash2 } from "lucide-react"
import Link from "next/link"
import * as Icons from "lucide-react"
import { updateSkillsOrder, deleteSkill } from "@/app/actions/portfolio"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog"

type Skill = {
  id: string
  name: string
  category: string
  icon: string
  order_index: number
}

type CategoryGroup = {
  id: string // Using category name as ID
  name: string
  skills: Skill[]
}

// Separate component for SkillItem
function SkillItem({ skill }: { skill: Skill }) {
  const controls = useDragControls()
  const IconComponent = skill.icon ? (Icons as any)[skill.icon] : null
  const [isOpen, setIsOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      await deleteSkill(skill.id)
      toast.success("Skill deleted successfully")
      setIsOpen(false)
    } catch (error: any) {
      toast.error("Failed to delete skill")
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <Reorder.Item 
      value={skill} 
      id={skill.id}
      dragListener={false} 
      dragControls={controls}
      className="grid grid-cols-3 px-6 py-5 border-b border-[#1e293b] hover:bg-white/[0.02] transition-colors group relative bg-transparent select-none"
    >
      {/* Absolute drag handle on the far left edge, invisible until hover */}
      <div 
        className="absolute left-2 top-1/2 -translate-y-1/2 cursor-grab active:cursor-grabbing text-slate-600 hover:text-slate-300 p-2 opacity-0 group-hover:opacity-100 transition-opacity"
        onPointerDown={(e) => {
          e.preventDefault()
          controls.start(e)
        }}
      >
        <GripVertical className="h-4 w-4" />
      </div>

      {/* Name */}
      <div className="flex items-center justify-center font-semibold text-slate-200">
        {skill.name}
      </div>

      {/* Icon */}
      <div className="flex items-center justify-center gap-4 text-slate-300">
        {IconComponent && <IconComponent className="h-4 w-4 text-slate-400" />}
        <span className="text-sm font-mono tracking-wide">{skill.icon || 'None'}</span>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-center gap-6">
        <Link href={`/admin/skills/${skill.id}`}>
          <Pencil className="h-4 w-4 text-blue-500 hover:text-blue-400 transition-colors cursor-pointer" />
        </Link>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger className="cursor-pointer">
            <Trash2 className="h-4 w-4 text-red-500 hover:text-red-400 transition-colors cursor-pointer" />
          </DialogTrigger>
          <DialogContent className="sm:max-w-md bg-[#0b1120] border-[#1e293b] shadow-2xl p-6">
            <DialogHeader className="gap-3">
              <DialogTitle className="text-xl flex items-center gap-2 text-slate-100">
                <div className="p-2 bg-red-500/10 rounded-full">
                  <Trash2 className="h-5 w-5 text-red-500" />
                </div>
                Delete Skill
              </DialogTitle>
              <DialogDescription className="text-slate-400 text-base leading-relaxed pt-2">
                Are you sure you want to delete <strong className="text-white font-semibold">{skill.name}</strong>? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="sm:justify-end gap-3 pt-6 border-t border-[#1e293b]/50 mt-2">
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
                variant="destructive"
                className="bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white shadow-lg hover:shadow-red-500/25 transition-all"
                onClick={handleDelete}
                disabled={isDeleting}
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Reorder.Item>
  )
}

// Separate component for Category
function CategoryItem({ 
  category, 
  onSkillsReorder 
}: { 
  category: CategoryGroup,
  onSkillsReorder: (categoryId: string, newSkills: Skill[]) => void
}) {
  const controls = useDragControls()

  return (
    <Reorder.Item 
      value={category} 
      id={category.id}
      dragListener={false} 
      dragControls={controls}
      className="mb-8"
    >
      <Card className="bg-[#0b1120] border-[#1e293b] shadow-2xl relative group overflow-hidden rounded-xl">
        
        <CardHeader className="border-b border-[#1e293b] pb-5 pt-5 px-6 flex flex-row items-center justify-between space-y-0">
          <div className="flex items-center gap-2">
            <div 
              className="cursor-grab active:cursor-grabbing text-slate-700 hover:text-slate-400 p-1 transition-colors -ml-2"
              onPointerDown={(e) => {
                e.preventDefault()
                controls.start(e)
              }}
            >
              <GripVertical className="h-5 w-5" />
            </div>
            <CardTitle className="text-xl font-bold text-slate-100 tracking-tight">
              {category.name}
            </CardTitle>
          </div>
          <span className="text-sm font-medium text-slate-400">
            {category.skills.length} skill{category.skills.length !== 1 && 's'}
          </span>
        </CardHeader>
        
        <CardContent className="p-0">
          {/* Table Header */}
          <div className="grid grid-cols-3 px-6 py-4 border-b border-[#1e293b] text-[11px] font-bold text-slate-500 tracking-widest uppercase">
            <div className="text-center">NAME</div>
            <div className="text-center">ICON</div>
            <div className="text-center">ACTIONS</div>
          </div>

          <Reorder.Group 
            axis="y" 
            values={category.skills} 
            onReorder={(newSkills) => onSkillsReorder(category.id, newSkills)}
            className="flex flex-col w-full min-h-[50px]"
          >
            {category.skills.map(skill => (
              <SkillItem key={skill.id} skill={skill} />
            ))}
            {category.skills.length === 0 && (
              <div className="text-center py-6 text-sm text-slate-500">
                No skills in this category
              </div>
            )}
          </Reorder.Group>
        </CardContent>
      </Card>
    </Reorder.Item>
  )
}

export function SkillsDndList({ initialSkills }: { initialSkills: Skill[] }) {
  const [categories, setCategories] = useState<CategoryGroup[]>([])
  const [isSaving, setIsSaving] = useState(false)
  const router = useRouter()

  // Initialize the grouped categories
  useEffect(() => {
    // Group skills by category based on their initial order_index sorted state
    const skillsByCategory = (initialSkills || []).reduce((acc, skill) => {
      const catName = skill.category || 'Uncategorized'
      if (!acc[catName]) {
        acc[catName] = { id: catName, name: catName, skills: [] }
      }
      acc[catName].skills.push(skill)
      return acc
    }, {} as Record<string, CategoryGroup>)

    // Maintain the order of categories as they appear in the sorted initialSkills
    const orderedCategories = Object.values(skillsByCategory)
    setCategories(orderedCategories)
  }, [initialSkills])

  // Handle reordering skills within a specific category
  const handleSkillsReorder = (categoryId: string, newSkills: Skill[]) => {
    setCategories(prev => prev.map(cat => 
      cat.id === categoryId ? { ...cat, skills: newSkills } : cat
    ))
  }

  // Handle saving the new visual layout to the database
  const handleSaveOrder = async () => {
    setIsSaving(true)
    
    try {
      // Flatten the visual layout into a 1-to-N list of updates
      const updates: { id: string, order_index: number }[] = []
      let globalIndex = 1
      
      categories.forEach(category => {
        category.skills.forEach(skill => {
          updates.push({
            id: skill.id,
            order_index: globalIndex
          })
          globalIndex++
        })
      })

      // Send updates to the server action
      await updateSkillsOrder(updates)
      
      toast.success("Layout Order Saved!")
      
      router.refresh()
    } catch (error: any) {
      toast.error("Failed to save order", {
        description: error.message,
      })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between bg-primary/5 border border-primary/20 rounded-xl p-4">
        <div>
          <h3 className="font-semibold text-primary">Interactive Layout Editor</h3>
          <p className="text-sm text-muted-foreground mt-1">Drag the handles (⋮⋮) to reorder Categories or individual Skills.</p>
        </div>
        <Button 
          onClick={handleSaveOrder} 
          disabled={isSaving}
          className="bg-primary text-primary-foreground shadow-lg hover:shadow-primary/25 transition-all"
        >
          {isSaving ? "Saving..." : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save Layout Order
            </>
          )}
        </Button>
      </div>

      <div className="pb-20">
        <Reorder.Group 
          axis="y" 
          values={categories} 
          onReorder={setCategories}
          className="space-y-6"
        >
          {categories.map(category => (
            <CategoryItem 
              key={category.id} 
              category={category} 
              onSkillsReorder={handleSkillsReorder} 
            />
          ))}
        </Reorder.Group>
      </div>
    </div>
  )
}
