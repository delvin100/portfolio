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
              Building and contributing in the open.
            </span>
          }
          centered
        />
        <div className="mt-12">
          <GithubStats username="delvin100" />
        </div>
        
        <div className="mt-16">
          <div className="relative group overflow-hidden rounded-2xl border border-blue-500/20 bg-blue-950/10 p-8 md:p-10 transition-all hover:border-blue-500/40 hover:bg-blue-950/20">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
              <div className="flex-1 space-y-4">
                <div className="inline-flex items-center rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-xs font-medium text-blue-400">
                  <span className="flex h-2 w-2 rounded-full bg-blue-500 mr-2 animate-pulse"></span>
                  Community Resource
                </div>
                
                <h3 className="text-2xl md:text-3xl font-bold text-slate-200">
                  Git Learning Hub
                </h3>
                
                <p className="text-slate-400 text-lg leading-relaxed max-w-2xl">
                  I created a comprehensive, easy-to-use Git documentation hub to help everyone—from beginners to advanced developers—master version control and quickly look up Git commands.
                </p>
              </div>
              
              <div className="flex-shrink-0">
                <a
                  href="/git"
                  className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-blue-500 hover:shadow-md hover:scale-105 active:scale-95"
                >
                  Explore the Guide
                  <svg xmlns="http://www.w3.org/2000/svg" className="ml-2 h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
