"use client"

import { motion } from "framer-motion"
import { Eye, Paperclip, Terminal } from "lucide-react"
import { SectionHeader } from "../ui/section-header"

import Image from "next/image"
interface AboutSectionProps {
  profilePictureUrl?: string;
  resumeUrl?: string;
}

export function AboutSection({ profilePictureUrl, resumeUrl }: AboutSectionProps) {
  return (
    <section id="about" className="py-24 relative z-10">
      <div className="container mx-auto px-6 md:px-12">
        <SectionHeader 
          title="About Me" 
          subtitle={
            <span className="font-handwriting text-2xl md:text-3xl text-primary/80 rotate-[-1deg] inline-block mt-2 tracking-wide">
              "As long as I live, there are infinite chances." <span className="text-xl">— Monkey D. Luffy</span>
            </span>
          } 
        />
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mt-12">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: false, margin: "-100px" }}
            transition={{ duration: 0.5 }}
            className="relative w-full"
          >
            {/* Terminal Window Wrapper */}
            <div className="relative rounded-2xl bg-[#0d1117] border border-white/10 overflow-hidden shadow-2xl font-mono text-sm leading-relaxed group">
              {/* Window Header */}
              <div className="relative flex items-center justify-between px-4 py-3 border-b border-white/5 bg-black/40">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500/80 border border-black/20" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/80 border border-black/20" />
                  <div className="w-3 h-3 rounded-full bg-green-500/80 border border-black/20" />
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-400 font-sans tracking-wide">
                  <Terminal size={14} />
                  <span>about_me.md</span>
                </div>
                <div className="w-12" />
              </div>
              
              {/* Terminal Content */}
              <div className="relative p-6 sm:p-8 overflow-x-auto text-slate-300 space-y-6">
                <p>
                  <span className="text-pink-400 font-bold">#</span> <span className="text-cyan-300 font-bold text-base tracking-wide">Introduction</span><br/>
                  <span className="inline-block mt-2 text-slate-400">
                    I'm a Full Stack Developer passionate about building fast, scalable, and user-focused web applications. Skilled in React, Next.js, Node.js, TypeScript, and modern databases, I focus on writing clean, maintainable code and delivering high-performance, production-ready solutions.
                  </span>
                </p>
                <p>
                  <span className="text-pink-400 font-bold">##</span> <span className="text-yellow-300 font-semibold tracking-wide">What I Do</span><br/>
                  <span className="inline-block mt-2 text-slate-400">
                    I build end-to-end web applications, from designing databases and developing secure APIs to creating fast, responsive, and accessible user interfaces. I focus on building scalable, maintainable, and production-ready solutions.
                  </span>
                </p>
                <p>
                  <span className="text-pink-400 font-bold">##</span> <span className="text-yellow-300 font-semibold tracking-wide">My Philosophy</span><br/>
                  <span className="inline-block mt-2 text-slate-400">
                    I enjoy solving complex engineering challenges with clean architecture, efficient code, and thoughtful user experiences. I believe great software is built by balancing performance, scalability, maintainability, and usability.
                  </span>
                </p>
                <p>
                  <span className="text-pink-400 font-bold">##</span> <span className="text-yellow-300 font-semibold tracking-wide">Current Focus</span><br/>
                  <span className="inline-block mt-2 text-slate-400">
                    While I continue building full-stack web applications, I'm currently expanding my knowledge in cybersecurity, secure application development, modern web architecture, and AI-powered applications to build more resilient and intelligent software.
                  </span>
                </p>
              </div>
            </div>
            
            <div className="pt-8">
              <a
                href={resumeUrl || "/resume.pdf"}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center px-6 py-3 text-sm font-medium text-foreground bg-surface border border-border rounded-full hover:bg-muted transition-all hover:scale-105 active:scale-95 interactive glass"
              >
                <Eye className="mr-2" size={16} />
                View Resume
              </a>
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9, rotate: -5 }}
            whileInView={{ opacity: 1, scale: 1, rotate: 2 }}
            whileHover={{ scale: 1.05, rotate: -2, y: -8 }}
            viewport={{ once: false, margin: "-50px" }}
            transition={{ type: "spring", duration: 0.8 }}
            className="relative mx-auto w-full max-w-[340px] mt-8 lg:-mt-12 group cursor-default"
          >
            {/* Masking Tape */}
            <div className="absolute -top-4 right-12 w-24 h-8 bg-yellow-100/90 rotate-[-8deg] z-20 shadow-sm border border-yellow-200/50 mix-blend-overlay" />
            
            {/* Paperclip */}
            <div className="absolute -top-6 left-8 z-20 text-slate-600 rotate-[15deg]">
              <Paperclip size={40} strokeWidth={1.5} />
            </div>
            
            {/* Polaroid Frame */}
            <div className="bg-white p-4 pb-12 shadow-2xl relative rounded-sm">
              <div className="aspect-[4/5] relative bg-slate-200 overflow-hidden rounded-sm border border-slate-100">
                <Image 
                  src={profilePictureUrl || "/profile.jpg"}
                  alt="Delvin Varghese" 
                  fill 
                  sizes="(max-width: 768px) 100vw, 50vw"
                  priority
                  className="object-cover transition-transform duration-700 group-hover:scale-110" 
                />
              </div>
              <h3 className="text-3xl font-bold text-center mt-6 text-slate-800 tracking-tight transition-colors duration-300 group-hover:text-primary">Delvin Varghese</h3>
            </div>
            
            {/* Skewed Badge */}
            <div className="absolute -bottom-6 right-0 bg-white border-2 border-slate-800 px-4 py-2 font-mono text-xs font-bold text-slate-800 uppercase tracking-widest shadow-[4px_4px_0px_0px_rgba(30,41,59,1)] rotate-[-4deg] z-20 flex items-center gap-2">
              WILL OF D(EVELOPER)
              <img src="/Straw-Hat-Logo-removebg-preview.png" alt="Straw Hat Logo" className="w-8 h-8 object-contain inline-block drop-shadow-sm shrink-0" />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
