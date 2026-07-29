"use client"

import { useState, useEffect } from "react"

import { motion } from "framer-motion"
import Image from "next/image"
import { ArrowUpRight } from "lucide-react"
import { FaGithub } from "react-icons/fa"
import { SectionHeader } from "../ui/section-header"
import { TechIcon } from "../ui/tech-icon"

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
  const [showAll, setShowAll] = useState(false);
  const [showFloating, setShowFloating] = useState(false);
  
  const visibleProjects = showAll ? projects : projects.slice(0, 4);

  useEffect(() => {
    if (!showAll) {
      setShowFloating(false);
      return;
    }

    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const proj5 = document.getElementById('project-4');
          const section = document.getElementById('projects');
          
          if (proj5 && section) {
            const proj5Rect = proj5.getBoundingClientRect();
            const sectionRect = section.getBoundingClientRect();
            
            const isPast4 = proj5Rect.top <= 150;
            const isNotAtBottom = sectionRect.bottom > window.innerHeight + 100;
            
            setShowFloating(prev => {
              const next = isPast4 && isNotAtBottom;
              return prev === next ? prev : next;
            });
          }
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    // Check initially after a short delay to allow DOM to update
    setTimeout(handleScroll, 100);
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, [showAll]);

  const handleToggleShow = () => {
    if (showAll) {
      // Instantly hide the extra projects and snap to the top of the section
      setShowAll(false);
      
      // Use setTimeout to allow the DOM to remove the extra projects first
      setTimeout(() => {
        const proj4 = document.getElementById('project-3');
        if (proj4) {
          proj4.scrollIntoView({ behavior: 'instant', block: 'center' });
        }
      }, 0);
    } else {
      setShowAll(true);
    }
  };

  return (
    <section id="projects" className="pt-24 pb-12 relative z-10">
      <div className="container mx-auto px-6 md:px-12">
        <SectionHeader 
          title="Featured Projects" 
          centered
          subtitle={
            <span 
              className="inline-block mt-4 text-xl md:text-2xl text-blue-400/90 -rotate-2 drop-shadow-md tracking-wide"
              style={{ fontFamily: 'var(--font-caveat), cursive' }}
            >
              Projects that showcase my technical journey.
            </span>
          } 
        />
        
        <div className="flex flex-col gap-10 mt-20">
          {visibleProjects.map((project, index) => {
            const isEven = index % 2 === 0;
            // Fixed top offset so they completely cover each other
            const topOffset = 120;
            
            return (
              <motion.div
                id={`project-${index}`}
                key={project.id}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.7, ease: "easeOut" }}
                className="relative group lg:sticky w-full bg-[#050505] border border-white/10 rounded-[2.5rem] p-6 lg:p-12 overflow-hidden shadow-2xl lg:top-[var(--sticky-top)]"
                style={{ '--sticky-top': `${topOffset}px` } as React.CSSProperties}
              >
                {/* Glass Shine Sweep on Hover */}
                <motion.div 
                  initial={{ x: "-100%", opacity: 0 }}
                  whileHover={{ x: "200%", opacity: 1 }}
                  transition={{ duration: 1.5, ease: "easeInOut" }}
                  className="absolute inset-0 w-1/3 bg-gradient-to-r from-transparent via-white/5 to-transparent skew-x-12 pointer-events-none z-50"
                />

                {/* Background Glow Orb inside the solid card */}
                <div aria-hidden="true" className={`absolute top-1/2 -translate-y-1/2 w-full max-w-lg h-[400px] bg-primary/30 blur-[120px] rounded-full pointer-events-none transition-all duration-700 opacity-20 group-hover:opacity-60 group-hover:scale-110 ${isEven ? 'right-0' : 'left-0'}`} />

                <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center z-10">
                  
                  {/* Content Container */}
                  <div className={`flex flex-col justify-center order-2 ${isEven ? 'lg:order-1' : 'lg:order-2'} relative`}>

                    {/* Elegant Circular Badge & Divider */}
                    <div aria-hidden="true" className={`flex items-center gap-5 mb-8 w-full transition-transform duration-500 ${!isEven ? 'lg:flex-row-reverse lg:group-hover:-translate-x-2 group-hover:translate-x-2' : 'group-hover:translate-x-2'}`}>
                      <div className="flex items-center justify-center w-12 h-12 rounded-full border border-white/10 bg-white/[0.02] text-white/60 font-mono text-lg shadow-[inset_0_0_20px_rgba(255,255,255,0.02)] group-hover:border-blue-500/30 group-hover:text-blue-400 transition-colors duration-500 shrink-0">
                        {String(index + 1).padStart(2, '0')}
                      </div>
                      <div className={`h-px flex-1 transition-colors duration-500 from-white/10 via-white/5 to-transparent group-hover:from-blue-500/30 ${!isEven ? 'bg-gradient-to-r lg:bg-gradient-to-l' : 'bg-gradient-to-r'}`}></div>
                    </div>

                    <h3 className="text-4xl lg:text-5xl font-bold mb-6 tracking-tight transition-all duration-500 bg-clip-text text-transparent bg-gradient-to-r from-white to-white group-hover:from-blue-400 group-hover:to-emerald-400 group-hover:translate-x-3 group-hover:scale-[1.02] origin-left">
                      {project.title}
                    </h3>
                    
                    <p className="text-slate-400 text-lg leading-relaxed mb-8 font-light max-w-xl">
                      {project.description}
                    </p>
                    
                    <div className="flex flex-wrap gap-3 mb-10">
                      {project.tags?.map((t, i) => (
                        <motion.span 
                          key={t}
                          animate={{ y: [0, -6, 0] }}
                          transition={{ 
                            duration: 4, 
                            repeat: Infinity, 
                            ease: "easeInOut",
                            delay: i * 0.2
                          }}
                          className="flex items-center gap-2 text-xs font-medium text-slate-300 bg-white/5 border border-white/10 px-3.5 py-1.5 rounded-full shadow-[0_0_15px_rgba(255,255,255,0.03)] select-none hover:bg-white/10 hover:shadow-[0_0_20px_rgba(255,255,255,0.1)] transition-all cursor-default"
                        >
                          <TechIcon name={t} className="w-4 h-4" />
                          {t}
                        </motion.span>
                      ))}
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-6">
                      {project.live_url && (
                        <div className="relative">
                          <a 
                            href={project.live_url} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="group/btn relative flex items-center gap-3 px-6 py-3 rounded-full bg-white text-black font-semibold hover:scale-105 hover:shadow-[0_0_30px_rgba(255,255,255,0.4)] transition-all duration-300 z-10 overflow-hidden"
                          >
                            <motion.div 
                              initial={{ x: "-100%" }}
                              whileHover={{ x: "200%" }}
                              transition={{ duration: 1, ease: "easeInOut", repeat: Infinity, repeatDelay: 0.5 }}
                              className="absolute inset-0 w-1/2 bg-gradient-to-r from-transparent via-black/10 to-transparent skew-x-12 pointer-events-none" 
                            />
                            <span className="relative z-10">Visit Live</span>
                            <ArrowUpRight size={18} strokeWidth={2.5} className="group-hover/btn:rotate-45 transition-transform relative z-10" />
                          </a>
                        </div>
                      )}
                      {project.github_url && !project.github_url.startsWith('HIDE_') && (
                        <a 
                          href={project.github_url} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="flex items-center justify-center w-12 h-12 rounded-full border border-white/20 text-slate-300 hover:text-white hover:border-white hover:bg-white/5 hover:scale-110 transition-all duration-300" 
                          aria-label="Source Code"
                        >
                          <FaGithub size={22} />
                        </a>
                      )}
                    </div>
                  </div>
                  
                  {/* Image Container (Browser Window) */}
                  <div className={`order-1 ${isEven ? 'lg:order-2' : 'lg:order-1'}`}>
                    <div className="relative rounded-2xl p-[1px] bg-gradient-to-b from-white/20 to-white/5 shadow-2xl group-hover:-translate-y-2 group-hover:rotate-1 transition-transform duration-700 ease-out">
                      
                      <div className="rounded-2xl bg-[#0a0a0a] overflow-hidden">
                        {/* Browser Header */}
                        <div className="flex items-center px-4 py-3 bg-[#111] border-b border-white/5">
                          <div className="flex gap-2">
                            <div className="w-3 h-3 rounded-full bg-red-500/80" />
                            <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                            <div className="w-3 h-3 rounded-full bg-green-500/80" />
                          </div>
                        </div>
                        
                        {/* Browser Content (Image) */}
                        <div className="relative aspect-video w-full overflow-hidden bg-white/5">
                          <Image 
                            src={project.image_url || "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1000&auto=format&fit=crop"} 
                            alt={project.title}
                            fill 
                            priority={true}
                            sizes="(max-width: 1024px) 100vw, 50vw"
                            quality={90}
                            className="object-cover object-top group-hover:scale-105 transition-transform duration-700 ease-out" 
                          />
                          <div aria-hidden="true" className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors duration-500" />
                        </div>
                      </div>
                      
                    </div>
                  </div>

                </div>
              </motion.div>
            );
          })}
        </div>

        {projects.length > 4 && (
          <div className="flex justify-center mt-12 h-12">
            <div className={`transition-all duration-300 ${showFloating ? 'fixed bottom-12 left-1/2 -translate-x-1/2 z-[100]' : ''}`}>
              <button
                onClick={handleToggleShow}
                className={`group relative px-6 py-2.5 text-sm rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white font-medium hover:bg-white/20 transition-all duration-300 overflow-hidden shadow-[0_10px_40px_rgba(0,0,0,0.5)] hover:shadow-[0_0_30px_rgba(59,130,246,0.3)]`}
              >
                <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-blue-500/20 to-emerald-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <span className="relative z-10 flex items-center gap-2 drop-shadow-md">
                  {showAll ? "Show Less" : "Show More Projects"}
                  <span>
                    {showAll ? "↑" : "↓"}
                  </span>
                </span>
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
