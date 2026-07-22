"use client"

import { useState, useEffect } from "react"
import { Reorder, useDragControls } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button, buttonVariants } from "@/components/ui/button"
import { Save, GripVertical, Pencil, Trash2 } from "lucide-react"
import Link from "next/link"
import * as Icons from "lucide-react"
import { IconRenderer } from "@/components/ui/icon-renderer"
import { updateSkillsOrder, deleteSkill, deleteSkills, updateCategoriesOrder, deleteCategory, deleteCategories } from "@/app/actions/portfolio"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { Checkbox } from "@/components/ui/checkbox"
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
  category_id: string
  category_name: string
  icon_type: string
  icon: string
  order_index: number
}

type RawCategory = {
  id: string
  name: string
  icon_type: string
  icon: string
  order_index: number
}

type CategoryGroup = RawCategory & {
  skills: Skill[]
}

// Separate component for SkillItem
function SkillItem({ 
  skill,
  isSelectionMode,
  isSelected,
  onToggleSelect,
  parentCatId,
  parentSkillsCount
}: { 
  skill: Skill
  isSelectionMode: boolean
  isSelected: boolean
  onToggleSelect: (id: string, parentCatId: string, skillsCount: number) => void
  parentCatId: string
  parentSkillsCount: number
}) {
  const controls = useDragControls()
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

      {/* Name */}
      <div className="flex items-center justify-start ml-8 font-semibold text-slate-200 gap-3">
        {isSelectionMode && (
          <Checkbox 
            checked={isSelected}
            onCheckedChange={() => onToggleSelect(skill.id, parentCatId, parentSkillsCount)}
            className="border-slate-500"
          />
        )}
        {skill.name}
      </div>

      {/* Icon */}
      <div className="flex items-center justify-center gap-4 text-slate-300">
        <IconRenderer iconType={skill.icon_type} iconValue={skill.icon} className="h-4 w-4 text-slate-400" />
        <span className="text-sm font-mono tracking-wide truncate max-w-[100px]">{skill.icon || 'None'}</span>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-center gap-6">
        {!isSelectionMode && (
          <>
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
          </>
        )}
      </div>
    </Reorder.Item>
  )
}

// Separate component for Category
function CategoryItem({ 
  category, 
  onSkillsReorder,
  isSelectionMode,
  isSelected,
  selectedSkillIds,
  onToggleCategory,
  onToggleSkill
}: { 
  category: CategoryGroup,
  onSkillsReorder: (categoryId: string, newSkills: Skill[]) => void
  isSelectionMode: boolean
  isSelected: boolean
  selectedSkillIds: Set<string>
  onToggleCategory: (id: string, skills: Skill[]) => void
  onToggleSkill: (id: string, parentCatId: string, skillsCount: number) => void
}) {
  const controls = useDragControls()
  const [isOpen, setIsOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDeleteCat = async () => {
    setIsDeleting(true)
    try {
      await deleteCategory(category.id)
      toast.success("Category deleted successfully")
      setIsOpen(false)
      // Note: We might need a page refresh or to lift this state up to fully remove it from UI without refresh, 
      // but for now, we'll just reload the page as it's the simplest way to reflect the deletion globally.
      window.location.reload()
    } catch (error: any) {
      toast.error("Failed to delete category")
    } finally {
      setIsDeleting(false)
    }
  }

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
              className="cursor-grab active:cursor-grabbing text-slate-700 hover:text-slate-400 p-2 transition-colors -ml-2 touch-none"
              onPointerDown={(e) => {
                if (!isSelectionMode) {
                  e.preventDefault()
                  controls.start(e)
                }
              }}
            >
              {!isSelectionMode && <GripVertical className="h-5 w-5" />}
            </div>
            {isSelectionMode && category.id !== 'uncategorized' && (
              <Checkbox 
                checked={isSelected}
                onCheckedChange={() => onToggleCategory(category.id, category.skills)}
                className="border-slate-400 data-[state=checked]:bg-emerald-500 data-[state=checked]:text-white mr-2"
              />
            )}
            <IconRenderer iconType={category.icon_type} iconValue={category.icon} className="h-6 w-6 text-emerald-400 mr-2" />
            <CardTitle className="text-xl font-bold text-slate-100 tracking-tight">
              {category.name}
            </CardTitle>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-slate-400">
              {category.skills.length} skill{category.skills.length !== 1 && 's'}
            </span>
            
            {category.id !== 'uncategorized' && !isSelectionMode && (
              <div className="flex items-center justify-center gap-3 ml-2">
                <Link href={`/admin/categories/${category.id}`}>
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
                        Delete Category
                      </DialogTitle>
                      <DialogDescription className="text-slate-400 text-base leading-relaxed pt-2">
                        Are you sure you want to delete <strong className="text-white font-semibold">{category.name}</strong>? This action cannot be undone. Any skills within this category will be deleted.
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
                        variant="destructive"
                        className="bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white shadow-lg hover:shadow-red-500/25 transition-all"
                        onClick={handleDeleteCat}
                        disabled={isDeleting}
                      >
                        {isDeleting ? "Deleting..." : "Delete"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            )}
          </div>
        </CardHeader>
        
        <CardContent className="p-0">
          {/* Table Header */}
          <div className="grid grid-cols-3 px-6 py-4 border-b border-[#1e293b] text-[11px] font-bold text-slate-500 tracking-widest uppercase">
            <div className="text-left ml-14">NAME</div>
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
              <SkillItem 
                key={skill.id} 
                skill={skill} 
                isSelectionMode={isSelectionMode}
                isSelected={selectedSkillIds.has(skill.id)}
                onToggleSelect={onToggleSkill}
                parentCatId={category.id}
                parentSkillsCount={category.skills.length}
              />
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

export function SkillsDndList({ initialSkills, categories: initialCategories }: { initialSkills: Skill[], categories: RawCategory[] }) {
  const [categories, setCategories] = useState<CategoryGroup[]>([])
  const [isSaving, setIsSaving] = useState(false)
  const [isSelectionMode, setIsSelectionMode] = useState(false)
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<Set<string>>(new Set())
  const [selectedSkillIds, setSelectedSkillIds] = useState<Set<string>>(new Set())
  const [isDeletingBulk, setIsDeletingBulk] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  
  const router = useRouter()

  useEffect(() => {
    const catMap = new Map<string, CategoryGroup>()
    const sortedCats = [...(initialCategories || [])].sort((a, b) => (a.order_index || 0) - (b.order_index || 0))
    sortedCats.forEach(cat => {
      catMap.set(cat.id, { ...cat, skills: [] })
    })
    ;(initialSkills || []).forEach(skill => {
      if (skill.category_id && catMap.has(skill.category_id)) {
        catMap.get(skill.category_id)!.skills.push(skill)
      } else {
        let uncategorized = catMap.get('uncategorized')
        if (!uncategorized) {
          uncategorized = { id: 'uncategorized', name: 'Uncategorized', icon_type: 'lucide', icon: 'HelpCircle', order_index: 999, skills: [] }
          catMap.set('uncategorized', uncategorized)
        }
        uncategorized.skills.push(skill)
      }
    })
    setCategories(Array.from(catMap.values()))
  }, [initialSkills, initialCategories])

  const handleSkillsReorder = (categoryId: string, newSkills: Skill[]) => {
    setCategories(prev => prev.map(cat => 
      cat.id === categoryId ? { ...cat, skills: newSkills } : cat
    ))
  }

  const handleSaveOrder = async () => {
    setIsSaving(true)
    try {
      const categoryUpdates: { id: string, order_index: number }[] = []
      categories.forEach((cat, index) => {
        if (cat.id !== 'uncategorized') {
          categoryUpdates.push({ id: cat.id, order_index: index + 1 })
        }
      })
      if (categoryUpdates.length > 0) await updateCategoriesOrder(categoryUpdates)
      const skillUpdates: { id: string, order_index: number }[] = []
      let globalIndex = 1
      categories.forEach(category => {
        category.skills.forEach(skill => {
          skillUpdates.push({ id: skill.id, order_index: globalIndex })
          globalIndex++
        })
      })
      await updateSkillsOrder(skillUpdates)
      toast.success("Layout Order Saved!")
      router.refresh()
    } catch (error: any) {
      toast.error("Failed to save order", { description: error.message })
    } finally {
      setIsSaving(false)
    }
  }

  const handleToggleSelectionMode = () => {
    setIsSelectionMode(!isSelectionMode)
    setSelectedCategoryIds(new Set())
    setSelectedSkillIds(new Set())
  }

  const handleToggleCategory = (categoryId: string, categorySkills: Skill[]) => {
    const newCatIds = new Set(selectedCategoryIds)
    const newSkillIds = new Set(selectedSkillIds)
    if (newCatIds.has(categoryId)) {
      newCatIds.delete(categoryId)
      categorySkills.forEach(s => newSkillIds.delete(s.id))
    } else {
      newCatIds.add(categoryId)
      categorySkills.forEach(s => newSkillIds.add(s.id))
    }
    setSelectedCategoryIds(newCatIds)
    setSelectedSkillIds(newSkillIds)
  }

  const handleToggleSkill = (skillId: string, parentCatId: string, parentSkillsCount: number) => {
    const newSkillIds = new Set(selectedSkillIds)
    const newCatIds = new Set(selectedCategoryIds)
    if (newSkillIds.has(skillId)) {
      newSkillIds.delete(skillId)
      newCatIds.delete(parentCatId)
    } else {
      newSkillIds.add(skillId)
      const catGroup = categories.find(c => c.id === parentCatId)
      if (catGroup) {
        const allSelected = catGroup.skills.every(s => newSkillIds.has(s.id))
        if (allSelected) newCatIds.add(parentCatId)
      }
    }
    setSelectedSkillIds(newSkillIds)
    setSelectedCategoryIds(newCatIds)
  }

  const handleBulkDelete = async () => {
    if (selectedCategoryIds.size === 0 && selectedSkillIds.size === 0) return
    setIsDeletingBulk(true)
    try {
      if (selectedCategoryIds.size > 0) await deleteCategories(Array.from(selectedCategoryIds))
      const skillsNotInCategory = Array.from(selectedSkillIds).filter(skillId => {
        const skill = initialSkills.find(s => s.id === skillId)
        return skill && !selectedCategoryIds.has(skill.category_id)
      })
      if (skillsNotInCategory.length > 0) await deleteSkills(skillsNotInCategory)
      toast.success("Selected items deleted successfully")
      setIsSelectionMode(false)
      setSelectedCategoryIds(new Set())
      setSelectedSkillIds(new Set())
      setIsDeleteDialogOpen(false)
      router.refresh()
    } catch (error: any) {
      toast.error("Failed to delete items", { description: error.message })
    } finally {
      setIsDeletingBulk(false)
    }
  }

  const selectedCategoryNames = categories.filter(c => selectedCategoryIds.has(c.id)).map(c => c.name)
  const selectedSkillNames: string[] = []
  categories.forEach(cat => {
    cat.skills.forEach(skill => {
      if (selectedSkillIds.has(skill.id) && !selectedCategoryIds.has(cat.id)) selectedSkillNames.push(skill.name)
    })
  })

  const formatNamesList = (names: string[]) => {
    if (names.length === 0) return ""
    if (names.length === 1) return names[0]
    if (names.length === 2) return `${names[0]} and ${names[1]}`
    return `${names.slice(0, -1).join(', ')}, and ${names[names.length - 1]}`
  }

  let deleteDescription = ""
  if (selectedCategoryNames.length > 0 && selectedSkillNames.length > 0) {
    deleteDescription = `<strong class="text-white font-semibold">${formatNamesList(selectedCategoryNames)}</strong> and <strong class="text-white font-semibold">${formatNamesList(selectedSkillNames)}</strong>`
  } else if (selectedCategoryNames.length > 0) {
    deleteDescription = `<strong class="text-white font-semibold">${formatNamesList(selectedCategoryNames)}</strong>`
  } else if (selectedSkillNames.length > 0) {
    deleteDescription = `<strong class="text-white font-semibold">${formatNamesList(selectedSkillNames)}</strong>`
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-primary/5 border border-primary/20 rounded-xl p-4">
        <div className="flex flex-col gap-2">
          <div>
            <h3 className="font-semibold text-primary">Interactive Layout Editor</h3>
            <p className="text-sm text-muted-foreground mt-1">Drag the handles (⋮⋮) to reorder Categories or individual Skills.</p>
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
          {isSelectionMode && (selectedCategoryIds.size > 0 || selectedSkillIds.size > 0) && (
            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
              <DialogTrigger render={<Button variant="destructive" className="transition-all" />}>
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Selected
              </DialogTrigger>
              <DialogContent className="sm:max-w-md bg-[#0b1120] border-[#1e293b] shadow-2xl p-6">
                <DialogHeader className="gap-3">
                  <DialogTitle className="text-xl flex items-center gap-2 text-slate-100">
                    <div className="p-2 bg-red-500/10 rounded-full">
                      <Trash2 className="h-5 w-5 text-red-500" />
                    </div>
                    Delete Selected Items
                  </DialogTitle>
                  <DialogDescription className="text-slate-400 text-base leading-relaxed pt-2">
                    Are you sure you want to delete <span dangerouslySetInnerHTML={{__html: deleteDescription}} />? This action cannot be undone.
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
                    variant="destructive"
                    className="bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white shadow-lg hover:shadow-red-500/25 transition-all"
                    onClick={handleBulkDelete}
                    disabled={isDeletingBulk}
                  >
                    {isDeletingBulk ? "Deleting..." : "Delete All Selected"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
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
              isSelectionMode={isSelectionMode}
              isSelected={selectedCategoryIds.has(category.id)}
              selectedSkillIds={selectedSkillIds}
              onToggleCategory={handleToggleCategory}
              onToggleSkill={handleToggleSkill}
            />
          ))}
        </Reorder.Group>
      </div>
    </div>
  )
}
