import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/server'
import { Briefcase, Code, FileText, Award } from 'lucide-react'
import Link from 'next/link'

async function getStats() {
  const supabase = await createClient()

  // Execute queries in parallel
  const [
    { count: projectsCount },
    { count: skillsCount },
    { count: expCount },
    { count: certsCount }
  ] = await Promise.all([
    supabase.from('projects').select('*', { count: 'exact', head: true }),
    supabase.from('skills').select('*', { count: 'exact', head: true }),
    supabase.from('experience').select('*', { count: 'exact', head: true }),
    supabase.from('certifications').select('*', { count: 'exact', head: true }),
  ])

  return {
    projects: projectsCount || 0,
    skills: skillsCount || 0,
    experience: expCount || 0,
    certifications: certsCount || 0,
  }
}

export default async function AdminOverviewPage() {
  const stats = await getStats()

  const cards = [
    { title: 'Total Projects', value: stats.projects, icon: Briefcase, color: 'text-blue-400', href: '/admin/projects' },
    { title: 'Experience Roles', value: stats.experience, icon: FileText, color: 'text-amber-400', href: '/admin/experience' },
    { title: 'Skills Tracked', value: stats.skills, icon: Code, color: 'text-emerald-400', href: '/admin/skills' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white">Dashboard Overview</h1>
        <p className="text-slate-400 mt-2 font-light">
          Welcome back! Here is a summary of your portfolio content.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {cards.map((card) => (
          <Link href={card.href} key={card.title} className="group outline-none">
            <Card className="h-full bg-white/5 backdrop-blur-md border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300 rounded-2xl relative">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-slate-400 group-hover:text-slate-300 transition-colors">{card.title}</CardTitle>
                <div className="p-2.5 rounded-xl bg-black/20 border border-white/5 group-hover:border-white/10 transition-colors">
                  <card.icon className={`h-5 w-5 ${card.color}`} />
                </div>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="text-4xl font-bold tracking-tight text-white">
                  {card.value}
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
      

    </div>
  )
}
