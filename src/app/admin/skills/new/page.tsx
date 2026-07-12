import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { SubmitButton } from '@/components/admin/submit-button'
import { Input } from '@/components/ui/input'
import { createSkill } from '@/app/actions/portfolio'
import Link from 'next/link'
import { Type, FolderTree, Image as ImageIcon, Sparkles } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { AutoFillScript } from '@/components/admin/auto-fill-script'

export default async function NewSkillPage() {
  const supabase = await createClient()
  const { data: skills } = await supabase.from('skills').select('category, icon')
  
  const categories = Array.from(new Set(skills?.map(s => s.category) || []))
  const categoryIconMap = (skills || []).reduce((acc, skill) => {
    if (skill.category && skill.icon && !acc[skill.category]) acc[skill.category] = skill.icon
    return acc
  }, {} as Record<string, string>)
  return (
    <div className="space-y-8 max-w-2xl mx-auto relative mt-10">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-primary/10 blur-[100px] rounded-full pointer-events-none -z-10" />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-emerald-400">Add New Skill</h1>
          <p className="text-muted-foreground mt-2">Expand your portfolio's technology stack.</p>
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
            Skill Details
          </CardTitle>
          <CardDescription>Enter the details for the new technology you've mastered.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={createSkill} className="space-y-6">
            <div className="space-y-3">
              <label htmlFor="name" className="text-sm font-medium flex items-center gap-2 text-foreground/80">
                <Type className="h-4 w-4 text-blue-400" />
                Skill Name
              </label>
              <Input id="name" name="name" required placeholder="e.g. React, TypeScript, Node.js" className="bg-background/50 border-white/10 focus-visible:ring-blue-500/50 transition-all h-12 text-lg" />
            </div>

            <div className="space-y-3">
              <label htmlFor="category" className="text-sm font-medium flex items-center gap-2 text-foreground/80">
                <FolderTree className="h-4 w-4 text-emerald-400" />
                Category
              </label>
              <Input id="category" name="category" required placeholder="e.g. Frontend, Backend, Tools" list="category-options" className="bg-background/50 border-white/10 focus-visible:ring-emerald-500/50 transition-all h-12 text-lg" />
              <datalist id="category-options">
                {categories.map((cat) => (
                  <option key={cat} value={cat} />
                ))}
              </datalist>
            </div>

            <div className="space-y-3">
              <label htmlFor="icon" className="text-sm font-medium flex items-center gap-2 text-foreground/80">
                <ImageIcon className="h-4 w-4 text-purple-400" />
                Icon Name (Lucide)
              </label>
              <Input id="icon" name="icon" required placeholder="e.g. Terminal" className="bg-background/50 border-white/10 focus-visible:ring-purple-500/50 transition-all h-12 text-lg" />
              <p className="text-sm text-muted-foreground pt-1 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-500 inline-block" />
                Suggested: Database, Terminal, Layout, Code2, Cpu, Server
              </p>
            </div>

            <div className="pt-6 flex justify-end">
              <SubmitButton label="Launch Skill" successMessage="Skill added successfully" />
            </div>
          </form>
          <AutoFillScript categoryIconMap={categoryIconMap} />
        </CardContent>
      </Card>
    </div>
  )
}
