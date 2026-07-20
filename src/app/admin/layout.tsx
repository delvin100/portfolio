'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Briefcase, Code, FileText, Award, LogOut, Settings } from 'lucide-react'
import { logout } from '@/app/actions/auth'
import { Button } from '@/components/ui/button'

const navItems = [
  { href: '/admin', label: 'Overview', icon: LayoutDashboard },
  { href: '/admin/projects', label: 'Projects', icon: Briefcase },
  { href: '/admin/experience', label: 'Experience', icon: FileText },
  { href: '/admin/skills', label: 'Skills', icon: Code },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-muted/20">
      
      {/* Mobile Top Header */}
      <header className="md:hidden sticky top-0 z-50 flex items-center justify-between p-4 bg-background border-b shadow-sm">
        <Link href="/" className="font-bold text-xl tracking-tight text-primary">
          Portfolio Admin
        </Link>
        <form action={logout}>
          <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive" type="submit">
            <LogOut className="h-5 w-5" />
          </Button>
        </form>
      </header>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 flex-col border-r bg-background shrink-0 sticky top-0 h-screen">
        <div className="p-6 border-b">
          <Link href="/" className="font-bold text-xl tracking-tight hover:text-primary transition-colors">
            Portfolio Admin
          </Link>
        </div>
        
        <nav className="flex-1 space-y-1 p-4 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                prefetch={true}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all ${
                  isActive 
                    ? 'bg-primary text-primary-foreground font-medium' 
                    : 'text-muted-foreground hover:bg-muted hover:text-primary'
                }`}
              >
                <item.icon className="h-5 w-5" />
                {item.label}
              </Link>
            )
          })}
        </nav>
        <div className="p-4 mt-auto">
          <form action={logout}>
            <button 
              type="submit" 
              className="flex items-center w-full gap-3 p-2 rounded-xl hover:bg-destructive/10 transition-colors group relative overflow-hidden border border-transparent hover:border-destructive/20"
            >
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-muted group-hover:bg-destructive/20 transition-all z-10 shadow-sm group-hover:shadow-destructive/20">
                <LogOut className="w-4 h-4 text-muted-foreground group-hover:text-destructive transition-all group-hover:translate-x-0.5" />
              </div>
              
              <div className="flex flex-col items-start z-10">
                <span className="text-sm font-semibold text-foreground group-hover:text-destructive transition-colors">Sign Out</span>
              </div>
            </button>
          </form>
        </div>
      </aside>
      
      <main className="flex-1 p-4 pb-24 md:p-8 overflow-y-auto">
        {children}
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-background border-t shadow-[0_-5px_15px_-10px_rgba(0,0,0,0.3)] z-50 flex justify-around items-center p-2 pb-safe">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              prefetch={true}
              className={`flex flex-col items-center justify-center w-full py-2 rounded-lg transition-all ${
                isActive 
                  ? 'text-primary' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <item.icon className={`h-6 w-6 mb-1 ${isActive ? 'fill-primary/20' : ''}`} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
