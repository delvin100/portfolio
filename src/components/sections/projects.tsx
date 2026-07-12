"use client"

import { motion } from "framer-motion"
import Image from "next/image"
import { ArrowUpRight } from "lucide-react"
import { FaGithub } from "react-icons/fa"
import { SectionHeader } from "../ui/section-header"

export interface Project {
  id: string;
  title: string;
  description: string;
  image_url: string;
  tags: string[];
  live_url: string;
  github_url: string;
}

export function ProjectsSection({ projects }: { projects: Project[] }) {
  return (
    <section id="projects" className="py-24 relative z-10">
      <div className="container mx-auto px-6 md:px-12">
        <SectionHeader 
          title="Featured Projects" 
          subtitle={
            <span 
              className="inline-block mt-4 text-xl md:text-2xl text-blue-400/90 -rotate-2 drop-shadow-md tracking-wide"
              style={{ fontFamily: 'var(--font-caveat), cursive' }}
            >
              what I've been cooking lately fr.
            </span>
          } 
        />
        
        <div className="flex flex-col gap-10 mt-20 pb-32">
          {projects.map((project, index) => {
            const topOffset = 100 + index * 40;
            
            return (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 100 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="sticky w-full bg-[#050505] border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl"
                style={{ top: `${topOffset}px` }}
              >
                 <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-white/10 min-h-[550px]">
                    
                    {/* Column 1: Meta (Number & Tags) - 3 cols */}
                    <div className="col-span-1 lg:col-span-3 p-10 lg:p-12 flex flex-col bg-white/[0.02]">
                       <span className="text-8xl lg:text-[10rem] font-black text-transparent [-webkit-text-stroke:2px_rgba(255,255,255,0.1)] group-hover:[-webkit-text-stroke:2px_rgba(var(--primary),0.5)] transition-all duration-700 mb-auto tracking-tighter leading-none select-none">
                         0{index+1}
                       </span>
                       <div className="flex flex-col gap-4 mt-12">
                          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">Tech Stack</span>
                          <div className="flex flex-wrap gap-2.5">
                            {project.tags?.map(t => (
                              <span key={t} className="text-xs font-mono text-slate-400 border border-white/10 px-3 py-1.5 rounded-full hover:border-white/30 transition-colors select-none">
                                {t}
                              </span>
                            ))}
                          </div>
                       </div>
                    </div>
                    
                    {/* Column 2: Main Content - 5 cols */}
                    <div className="col-span-1 lg:col-span-5 p-10 lg:p-12 flex flex-col justify-center relative overflow-hidden">
                       {/* Background abstract element */}
                       <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[80px] -z-10 group-hover:bg-primary/20 transition-colors duration-700" />
                       
                       <h3 className="text-4xl lg:text-5xl font-black text-white mb-6 tracking-tighter leading-tight relative z-10 group-hover:text-primary transition-colors duration-500">
                         {project.title}
                       </h3>
                       <p className="text-slate-400 text-lg leading-relaxed mb-14 relative z-10 font-light">
                         {project.description}
                       </p>
                       
                       <div className="flex items-center gap-8 mt-auto relative z-10">
                          <a 
                            href={project.live_url || "#"} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="group/btn flex items-center gap-4 text-white font-bold hover:text-white transition-colors uppercase tracking-widest text-sm"
                          >
                             <div className="w-14 h-14 rounded-full border border-white/20 flex items-center justify-center group-hover/btn:border-white group-hover/btn:bg-white group-hover/btn:text-black transition-all duration-500">
                                <ArrowUpRight size={20} strokeWidth={2} className="transition-transform duration-500 group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1" />
                             </div>
                             Live Project
                          </a>
                          <a 
                            href={project.github_url || "#"} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="text-slate-600 hover:text-white transition-colors" 
                            aria-label="Source Code"
                          >
                             <FaGithub size={28} />
                          </a>
                       </div>
                    </div>
                    
                    {/* Column 3: Image - 4 cols */}
                    <div className="col-span-1 lg:col-span-4 relative min-h-[400px] lg:min-h-full bg-slate-900 group/img overflow-hidden">
                       <Image 
                         src={project.image_url || "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1000&auto=format&fit=crop"} 
                         alt={project.title}
                         fill 
                         sizes="(max-width: 1024px) 100vw, 33vw"
                         className="object-cover grayscale group-hover/img:grayscale-0 group-hover/img:scale-110 transition-all duration-1000 ease-out" 
                       />
                       <div className="absolute inset-0 bg-primary/20 mix-blend-overlay opacity-0 group-hover/img:opacity-100 transition-opacity duration-1000" />
                       <div className="absolute inset-0 shadow-[inset_0_0_40px_rgba(0,0,0,0.8)] pointer-events-none" />
                    </div>
                 </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  )
}
