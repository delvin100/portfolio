import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { SubmitButton } from '@/components/admin/submit-button'
import { Input } from '@/components/ui/input'
import { createCategory } from '@/app/actions/portfolio'
import Link from 'next/link'
import { Type, LayoutDashboard, Sparkles } from 'lucide-react'
import { IconSelector } from '@/components/admin/icon-selector'

export default function NewCategoryPage() {
  return (
    <div className="space-y-8 max-w-2xl mx-auto relative mt-10">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-primary/10 blur-[100px] rounded-full pointer-events-none -z-10" />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-emerald-400">Add Category</h1>
          <p className="text-muted-foreground mt-2">Create a new group for your skills.</p>
        </div>
        <Link href="/admin/skills">
          <Button variant="outline" className="border-white/10 hover:bg-white/5">Cancel</Button>
        </Link>
      </div>

      <Card className="glass-card border-white/10 shadow-2xl overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-emerald-500" />
        <CardHeader className="pb-6">
          <CardTitle className="text-2xl flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-blue-400" />
            Category Details
          </CardTitle>
          <CardDescription>Name and icon for the new category.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={createCategory} className="space-y-6">
            <div className="space-y-3">
              <label htmlFor="name" className="text-sm font-medium flex items-center gap-2 text-foreground/80">
                <Type className="h-4 w-4 text-blue-400" />
                Category Name
              </label>
              <Input id="name" name="name" required placeholder="e.g. Frontend, Backend" className="bg-background/50 border-white/10 focus-visible:ring-blue-500/50 transition-all h-12 text-lg" />
            </div>

            <IconSelector />

            <div className="pt-6 flex justify-end">
              <SubmitButton label="Create Category" />
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
