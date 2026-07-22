"use client"

import { GithubStats } from "../github-stats"
import { SectionHeader } from "../ui/section-header"

export function OpenSourceSection() {
  return (
    <section id="open-source" className="py-24 relative z-10 border-t border-white/5 bg-zinc-950/20">
      <div className="container mx-auto px-6 md:px-12 max-w-5xl">
        <SectionHeader 
          title="GitHub Profile" 
          subtitle={
            <span 
              className="inline-block mt-4 text-xl md:text-2xl text-blue-400/90 rotate-1 drop-shadow-md tracking-wide"
              style={{ fontFamily: 'var(--font-caveat), cursive' }}
            >
              building and contributing in the open.
            </span>
          }
          centered
        />
        <div className="mt-12">
          <GithubStats username="delvin100" />
        </div>
      </div>
    </section>
  )
}
