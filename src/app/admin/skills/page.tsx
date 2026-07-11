import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button, buttonVariants } from '@/components/ui/button'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import * as Icons from 'lucide-react'
import Link from 'next/link'
import { deleteSkill } from '@/app/actions/portfolio'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

export default async function AdminSkillsPage() {
  const supabase = await createClient()

  const { data: skills, error } = await supabase
    .from('skills')
    .select('*')
    .order('category', { ascending: true })

  if (error) {
    return <div>Error loading skills: {error.message}</div>
  }

  // Group skills by category
  const skillsByCategory = (skills || []).reduce((acc, skill: any) => {
    const category = skill.category || 'Uncategorized';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(skill);
    return acc;
  }, {} as Record<string, any[]>);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Skills</h1>
          <p className="text-muted-foreground mt-2">
            Manage the skills displayed on your portfolio.
          </p>
        </div>
        <Link href="/admin/skills/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Skill
          </Button>
        </Link>
      </div>

      {skills.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-6 text-muted-foreground">
              No skills found. Click "Add Skill" to create one.
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-8">
          {(Object.entries(skillsByCategory) as [string, any[]][]).map(([category, categorySkills]) => (
            <Card key={category}>
              <CardHeader className="bg-secondary/5 border-b border-border/50 pb-4">
                <CardTitle className="text-xl flex items-center justify-between">
                  {category}
                  <span className="text-sm font-normal text-muted-foreground bg-secondary/20 px-2.5 py-0.5 rounded-full">
                    {categorySkills.length} skill{categorySkills.length !== 1 && 's'}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-2 sm:p-6">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent bg-secondary/10">
                      <TableHead className="w-[40%] text-center text-xs uppercase tracking-wider font-semibold text-muted-foreground">Name</TableHead>
                      <TableHead className="w-[40%] text-center text-xs uppercase tracking-wider font-semibold text-muted-foreground">Icon</TableHead>
                      <TableHead className="w-[20%] text-center text-xs uppercase tracking-wider font-semibold text-muted-foreground">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {categorySkills.map((skill) => {
                      const IconComponent = skill.icon ? (Icons as any)[skill.icon] : null;
                      return (
                        <TableRow key={skill.id}>
                          <TableCell className="font-medium text-center">{skill.name}</TableCell>
                          <TableCell>
                            <div className="flex items-center justify-center gap-3">
                              {IconComponent && <IconComponent className="h-5 w-5 text-muted-foreground" />}
                              <span className="inline-flex items-center px-2 py-1 rounded-md bg-secondary/10 text-secondary-foreground text-xs font-mono">
                                {skill.icon || 'None'}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                          <Link href={`/admin/skills/${skill.id}`} className={buttonVariants({ variant: "ghost", size: "icon", className: "h-8 w-8" })}>
                            <Pencil className="h-4 w-4 text-blue-500" />
                            <span className="sr-only">Edit</span>
                          </Link>
                          <form action={async () => {
                            'use server'
                            await deleteSkill(skill.id)
                          }} className="inline-block">
                            <Button type="submit" variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-700">
                              <Trash2 className="h-4 w-4" />
                              <span className="sr-only">Delete</span>
                            </Button>
                          </form>
                        </TableCell>
                      </TableRow>
                    )})}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
