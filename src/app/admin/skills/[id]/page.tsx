import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { SubmitButton } from '@/components/admin/submit-button'
import { Input } from '@/components/ui/input'
import { updateSkill } from '@/app/actions/portfolio'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Type, FolderTree, Sparkles } from 'lucide-react'
import { IconSelector } from '@/components/admin/icon-selector'

export default async function EditSkillPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient()
  const { data: skill, error } = await supabase.from('skills').select('*').eq('id', id).single()
  const { data: categories } = await supabase.from('skill_categories').select('id, name')

  if (error || !skill) {
    redirect('/admin/skills')
  }

  const updateSkillWithId = updateSkill.bind(null, id)

  return (
    <div className="space-y-8 max-w-2xl mx-auto relative mt-10">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-primary/10 blur-[100px] rounded-full pointer-events-none -z-10" />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-emerald-400">Edit Skill</h1>
          <p className="text-muted-foreground mt-2">Update your existing technology stack details.</p>
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
          <CardDescription>Modify the properties for {skill.name}.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={updateSkillWithId} className="space-y-6">
            <div className="space-y-3">
              <label htmlFor="name" className="text-sm font-medium flex items-center gap-2 text-foreground/80">
                <Type className="h-4 w-4 text-blue-400" />
                Skill Name
              </label>
              <Input id="name" name="name" required defaultValue={skill.name} className="bg-background/50 border-white/10 focus-visible:ring-blue-500/50 transition-all h-12 text-lg" />
            </div>

            <div className="space-y-3">
              <label htmlFor="category_id" className="text-sm font-medium flex items-center gap-2 text-foreground/80">
                <FolderTree className="h-4 w-4 text-emerald-400" />
                Category
              </label>
              <div className="relative">
                <select 
                  id="category_id" 
                  name="category_id" 
                  required 
                  defaultValue={skill.category_id}
                  className="appearance-none flex h-12 w-full rounded-md bg-background/50 border border-white/10 px-4 py-2 pr-12 text-lg ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50 disabled:cursor-not-allowed disabled:opacity-50 transition-all cursor-pointer text-slate-100"
                >
                  <option value="" className="bg-slate-900 text-slate-100">Select a category...</option>
                  {categories?.map((cat) => (
                    <option key={cat.id} value={cat.id} className="bg-slate-900 text-slate-100">{cat.name}</option>
                  ))}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                </div>
              </div>
            </div>

            <IconSelector defaultType={skill.icon_type} defaultValue={skill.icon} />

            <div className="pt-6 flex justify-end">
              <SubmitButton label="Save Changes" />
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
