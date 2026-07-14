"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { ArrowRight, Terminal } from "lucide-react"
import Image from "next/image"

function TypewriterHeading() {
  const [text1, setText1] = useState("")
  const [text2, setText2] = useState("")
  const [phase, setPhase] = useState(0) // 0: wait for loader, 1: typing 1, 2: typing 2, 3: paused, 4: deleting 2
  
  const fullText1 = "Hello, I'm"
  const fullText2 = "Delvin."
  
  useEffect(() => {
    let timeout: NodeJS.Timeout
    
    if (phase === 0) {
      timeout = setTimeout(() => setPhase(1), 3200) // Wait 3.2s for loading screen to finish
    } else if (phase === 1) {
      if (text1 === fullText1) {
        timeout = setTimeout(() => setPhase(2), 300)
      } else {
        timeout = setTimeout(() => {
          setText1(fullText1.substring(0, text1.length + 1))
        }, 80)
      }
    } else if (phase === 2) {
      if (text2 === fullText2) {
        timeout = setTimeout(() => setPhase(3), 2500)
      } else {
        timeout = setTimeout(() => {
          setText2(fullText2.substring(0, text2.length + 1))
        }, 120)
      }
    } else if (phase === 3) {
      timeout = setTimeout(() => setPhase(4), 100)
    } else if (phase === 4) {
      if (text2 === "") {
        timeout = setTimeout(() => setPhase(2), 600)
      } else {
        timeout = setTimeout(() => {
          setText2(fullText2.substring(0, text2.length - 1))
        }, 60)
      }
    }
    
    return () => clearTimeout(timeout)
  }, [text1, text2, phase])
  
  return (
    <motion.h1
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 3.2 }} // Delay fade-in to match typing start
      className="text-6xl md:text-7xl lg:text-[5.5rem] font-bold tracking-tight mb-4 leading-[1.1] min-h-[2.2em]"
    >
      <span className="text-white">
        {text1}
        {(phase === 0 || phase === 1) && (
          <motion.span 
            animate={{ opacity: [1, 0, 1] }}
            transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}
            className="inline-block w-[4px] h-[0.9em] bg-white ml-2 -mb-2"
          />
        )}
      </span> 
      <br />
      <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-blue-300">
        {text2}
      </span>
      {phase > 1 && (
        <motion.span 
          animate={{ opacity: [1, 0, 1] }}
          transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}
          className="inline-block w-[5px] h-[0.9em] bg-blue-400 ml-3 -mb-2"
        />
      )}
    </motion.h1>
  )
}

export function HeroSection() {
  return (
    <section className="min-h-screen flex items-center justify-center pt-20 pb-12 overflow-hidden relative">
      {/* Subtle background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-500/10 rounded-full blur-[120px] opacity-50 pointer-events-none" />
      
      <div className="container mx-auto px-6 md:px-12 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center">
          
          {/* Left Column: Content */}
          <div className="flex flex-col items-center lg:items-start text-center lg:text-left">
            
            {/* Status Pill */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="flex justify-center lg:justify-start mb-8"
            >
              <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md shadow-lg">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                </span>
                <span className="text-sm font-medium text-slate-200 tracking-wide uppercase text-[0.7rem]">
                  Available for work
                </span>
              </div>
            </motion.div>
            
            {/* Main Heading */}
            <TypewriterHeading />
            
            {/* Paragraph */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-xl md:text-2xl text-slate-400 max-w-xl mb-10 leading-relaxed font-light"
            >
              A <span className="inline-block px-3 py-0.5 mx-1 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 border border-blue-500/20 rounded-lg text-blue-200 font-medium text-lg md:text-xl shadow-sm backdrop-blur-sm">Full-stack</span> developer passionate about building elegant, scalable, and user-centric digital experiences.
            </motion.p>
            
            {/* Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-5 w-full sm:w-auto"
            >
              <a
                href="#contact"
                className="group relative inline-flex items-center justify-center px-8 py-4 font-mono text-sm font-bold text-primary bg-[#050505] border border-primary/40 rounded-lg overflow-hidden transition-all hover:bg-primary/5 hover:border-primary hover:shadow-[0_0_25px_rgba(var(--primary),0.3)] hover:-translate-y-1"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/10 to-primary/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-in-out" />
                <span className="mr-3 text-pink-500 font-black text-base">{">"}</span>
                <span className="tracking-wider text-base">Let's Talk</span>
                <span className="ml-2 w-2.5 h-5 bg-primary animate-pulse opacity-80 group-hover:opacity-100 transition-opacity duration-300"></span>
              </a>
              
              <a
                href="#projects"
                className="group relative inline-flex items-center justify-center px-8 py-4 font-mono text-sm font-medium text-slate-300 bg-surface/50 border border-border rounded-lg transition-all hover:bg-white/5 hover:border-white/20 hover:text-white hover:-translate-y-1 backdrop-blur-sm shadow-xl"
              >
                <span className="mr-3 text-emerald-400 font-bold text-base">~/</span>
                <span className="tracking-wide text-base">Explore Work</span>
              </a>
            </motion.div>
          </div>

          {/* Right Column: Code Snippet Window */}
          <motion.div 
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.2, type: "spring" }}
            className="relative mx-auto w-full lg:max-w-xl mb-10 lg:mb-0"
          >
            {/* Background glow behind editor */}
            <div className="absolute -inset-2 bg-gradient-to-r from-blue-500 to-cyan-400 rounded-[24px] blur-xl opacity-20 group-hover:opacity-40 transition duration-1000" />
            
            {/* The Editor Window Wrapper with Animated Border */}
            <div className="relative rounded-2xl p-[1px] overflow-hidden shadow-2xl">
              {/* Rotating Gradient */}
              <motion.div 
                className="absolute inset-[-100%] w-[300%] h-[300%] origin-center bg-[conic-gradient(from_0deg_at_50%_50%,#3b82f6_0%,transparent_10%,transparent_40%,#a855f7_50%,transparent_60%,transparent_90%,#06b6d4_100%)] opacity-80"
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 5, ease: "linear" }}
              />
              
              {/* The Editor Window */}
              <div className="relative rounded-2xl bg-[#0d1117] overflow-hidden font-mono text-sm h-full w-full">
              
              {/* Window Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 bg-black/20">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500/80 border border-black/20" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/80 border border-black/20" />
                  <div className="w-3 h-3 rounded-full bg-green-500/80 border border-black/20" />
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <Terminal size={14} />
                  <span>delvin.ts</span>
                </div>
                <div className="w-12" /> {/* Spacer for centering */}
              </div>
              
              {/* Code Content */}
              <div className="p-6 overflow-x-auto">
                <div className="flex leading-loose">
                  {/* Line Numbers */}
                  <div className="text-slate-600 select-none pr-6 text-right">
                    1<br/>2<br/>3<br/>4<br/>5<br/>6<br/>7<br/>8<br/>9<br/>10<br/>11
                  </div>
                  {/* Code */}
                  <div className="text-slate-300">
                    <span className="text-pink-400">const</span> <span className="text-blue-400">developer</span> = {'{'}
                    <br/>
                    {'  '}name: <span className="text-yellow-300">'Delvin Varghese'</span>,
                    <br/>
                    {'  '}role: <span className="text-yellow-300">'Full Stack Developer'</span>,
                    <br/>
                    {'  '}style: <span className="text-yellow-300">'Vibe Coding'</span>,
                    <br/>
                    {'  '}skills: [<span className="text-yellow-300">'React'</span>, <span className="text-yellow-300">'TypeScript'</span>, <span className="text-yellow-300">'Node.js'</span>, <span className="text-yellow-300">'Databases'</span>],
                    <br/>
                    {'  '}passion: <span className="text-yellow-300">'Building scalable systems'</span>,
                    <br/>
                    {'}'};
                    <br/><br/>
                    <span className="text-pink-400">export default</span> <span className="text-cyan-300">function</span> <span className="text-green-300">buildFuture</span>() {'{'}
                    <br/>
                    {'  '}<span className="text-pink-400">return</span> developer.<span className="text-blue-300">code</span>();
                    <br/>
                    {'}'}
                  </div>
                </div>
              </div>
              
            </div>
            </div>
          </motion.div>

        </div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 1 }}
        className="hidden md:flex absolute bottom-6 left-1/2 -translate-x-1/2 flex-col items-center gap-2"
      >
        <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-medium">Scroll to discover</span>
        <div className="w-[1px] h-8 bg-border relative overflow-hidden">
          <motion.div
            className="w-full h-1/2 bg-blue-500 absolute top-0"
            animate={{ top: ["-50%", "100%"] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          />
        </div>
      </motion.div>
    </section>
  )
}
