import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { createCertification } from '@/app/actions/portfolio'
import { SubmitButton } from '@/components/admin/submit-button'
import Link from 'next/link'
import { Award, ArrowLeft } from 'lucide-react'

export default function NewCertificationPage() {
  return (
    <div className="space-y-8 max-w-2xl mx-auto relative mt-10 pb-12">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[120%] h-[600px] bg-primary/10 blur-[100px] rounded-full pointer-events-none -z-10 transform-gpu" />

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-400">Add Certification</h1>
          <p className="text-muted-foreground mt-2 text-sm sm:text-base">Add a new professional certificate or award.</p>
        </div>
        <Link href="/admin/certifications" className="w-full sm:w-auto">
          <Button variant="outline" className="w-full border-white/10 hover:bg-white/5">Cancel</Button>
        </Link>
      </div>

      <Card className="relative border-muted/30 shadow-xl shadow-black/5 bg-surface/40 backdrop-blur-sm overflow-hidden mt-1">
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-blue-500 to-cyan-400" />
        <CardHeader className="pb-6 pt-8">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-500/10 rounded-xl">
              <Award className="w-6 h-6 text-blue-500" />
            </div>
            <CardTitle className="text-xl">Certification Details</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <form action={createCertification} className="space-y-6">
            <div className="flex flex-col gap-2">
              <label htmlFor="name" className="text-sm font-medium text-muted-foreground">Certification Name</label>
              <Input id="name" name="name" required placeholder="e.g. AWS Certified Solutions Architect" className="h-12 bg-muted/10 border-muted-foreground/20 focus-visible:ring-blue-500/50" />
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="issuer" className="text-sm font-medium text-muted-foreground">Issuer / Organization</label>
              <Input id="issuer" name="issuer" required placeholder="e.g. Amazon Web Services" className="h-12 bg-muted/10 border-muted-foreground/20 focus-visible:ring-blue-500/50" />
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="date" className="text-sm font-medium text-muted-foreground">Date Achieved</label>
              <Input id="date" name="date" type="date" max={new Date().toISOString().split('T')[0]} className="h-12 bg-muted/10 border-muted-foreground/20 focus-visible:ring-blue-500/50" />
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="description" className="text-sm font-medium text-muted-foreground">Description <span className="text-xs opacity-70">(Optional)</span></label>
              <Textarea id="description" name="description" rows={4} placeholder="Brief description of the certification..." className="bg-muted/10 border-muted-foreground/20 focus-visible:ring-blue-500/50 resize-none" />
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="linkedin_url" className="text-sm font-medium text-muted-foreground">LinkedIn Post URL <span className="text-xs opacity-70">(Optional)</span></label>
              <Input id="linkedin_url" name="linkedin_url" type="url" placeholder="https://www.linkedin.com/posts/..." className="h-12 bg-muted/10 border-muted-foreground/20 focus-visible:ring-blue-500/50" />
            </div>

            <div className="pt-6 flex justify-end">
              <SubmitButton label="Add Certification" />
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
