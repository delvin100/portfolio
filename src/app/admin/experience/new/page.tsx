import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { createExperience } from '@/app/actions/portfolio'
import Link from 'next/link'
import { Briefcase, ArrowLeft } from 'lucide-react'

export default function NewExperiencePage() {
  return (
    <div className="space-y-8 max-w-2xl mx-auto pb-12">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Add Experience</h1>
        <Link href="/admin/experience">
          <Button variant="outline" className="gap-2 border-muted-foreground/20 hover:bg-muted/20">
            <ArrowLeft className="w-4 h-4" /> Back
          </Button>
        </Link>
      </div>

      <Card className="relative border-muted/30 shadow-xl shadow-black/5 bg-surface/40 backdrop-blur-sm overflow-hidden mt-1">
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-blue-500 to-cyan-400" />
        <CardHeader className="pb-6 pt-8">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-500/10 rounded-xl">
              <Briefcase className="w-6 h-6 text-blue-500" />
            </div>
            <CardTitle className="text-xl">Experience Details</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <form action={createExperience} className="space-y-6">
            <div className="flex flex-col gap-2">
              <label htmlFor="role" className="text-sm font-medium text-muted-foreground">Role / Title</label>
              <Input id="role" name="role" required placeholder="e.g. Full Stack Developer" className="h-12 bg-muted/10 border-muted-foreground/20 focus-visible:ring-blue-500/50" />
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="company" className="text-sm font-medium text-muted-foreground">Company</label>
              <Input id="company" name="company" required placeholder="e.g. Google, Tech Corp..." className="h-12 bg-muted/10 border-muted-foreground/20 focus-visible:ring-blue-500/50" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <label htmlFor="start_date" className="text-sm font-medium text-muted-foreground">Start Date</label>
                <Input id="start_date" name="start_date" type="date" className="h-12 bg-muted/10 border-muted-foreground/20 focus-visible:ring-blue-500/50" />
              </div>
              <div className="flex flex-col gap-2">
                <label htmlFor="end_date" className="text-sm font-medium text-muted-foreground">End Date <span className="text-xs opacity-70">(Empty = Present)</span></label>
                <Input id="end_date" name="end_date" type="date" className="h-12 bg-muted/10 border-muted-foreground/20 focus-visible:ring-blue-500/50" />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="description" className="text-sm font-medium text-muted-foreground">Description</label>
              <Textarea id="description" name="description" required placeholder="Describe your responsibilities" rows={5} className="bg-muted/10 border-muted-foreground/20 focus-visible:ring-blue-500/50 resize-none" />
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="icon" className="text-sm font-medium text-muted-foreground">Icon Name (Lucide)</label>
              <Input id="icon" name="icon" placeholder="e.g. Briefcase" className="h-12 bg-muted/10 border-muted-foreground/20 focus-visible:ring-blue-500/50" />
              <p className="text-xs text-muted-foreground mt-1">Valid icons: Briefcase, GraduationCap</p>
            </div>

            <div className="pt-6">
              <Button type="submit" className="w-full h-12 bg-blue-500 hover:bg-blue-600 text-white font-medium shadow-lg shadow-blue-500/20 transition-all hover:-translate-y-0.5 active:translate-y-0">
                Create Experience
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
