import { createClient } from "@/lib/supabase/server"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { HeroSection } from "@/components/sections/hero"
import { AboutSection } from "@/components/sections/about"
import { SkillsSection } from "@/components/sections/skills"
import { ProjectsSection } from "@/components/sections/projects"
import { ExperienceSection } from "@/components/sections/experience"
import { ContactSection } from "@/components/sections/contact"

export const revalidate = 60; // Cache this page for 1 minute (60 seconds)

export default async function Home() {
  const supabase = await createClient()

  // Fetch all required data in parallel
  const [
    { data: projects },
    { data: skills },
    { data: experiences }
  ] = await Promise.all([
    supabase.from('projects').select('*').order('order_index', { ascending: true }),
    supabase.from('skills').select('*').order('order_index', { ascending: true }),
    supabase.from('experience').select('*').order('start_date', { ascending: false, nullsFirst: false })
  ])

  return (
    <>
      <Navbar />
      <HeroSection />
      <AboutSection />
      <SkillsSection skills={skills || []} />
      <ProjectsSection projects={(projects || []).filter(p => p.is_published)} />
      <ExperienceSection experiences={experiences || []} />
      <ContactSection />
      <Footer />
    </>
  )
}
