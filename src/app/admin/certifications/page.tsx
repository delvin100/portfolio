import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import Link from 'next/link'
import { CertificationsDndList } from '@/components/admin/certifications-dnd-list'

export default async function AdminCertificationsPage() {
  const supabase = await createClient()

  const { data: certifications, error } = await supabase
    .from('certifications')
    .select('*')
    .order('order_index', { ascending: true })
    .order('date', { ascending: false, nullsFirst: false })

  if (error) {
    return <div>Error loading certifications: {error.message}</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Certifications & Awards</h1>
          <p className="text-muted-foreground mt-2">
            Manage your professional certificates and achievements.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto justify-end">
          <Link href="/admin/certifications/new">
            <Button>
              <Plus className="h-4 w-4" />
              Add Certification
            </Button>
          </Link>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Certifications</CardTitle>
          <CardDescription>
            You have {certifications.length} certification record(s) in total.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CertificationsDndList initialCerts={certifications} />
        </CardContent>
      </Card>
    </div>
  )
}
