"use client"

import { motion } from "framer-motion"
import { useRef, useState, useEffect } from "react"
import { Award, Trophy, Medal, Calendar, ChevronLeft, ChevronRight, Star, Crown, Shield } from "lucide-react"
import { SectionHeader } from "../ui/section-header"

export interface Certification {
  id: string;
  name: string;
  issuer: string;
  date: string | null;
  description?: string | null;
  linkedin_url?: string | null;
}



const formatDate = (dateString: string | null) => {
  if (!dateString) return 'No Date';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
};

export function CertificationsSection({ certifications }: { certifications?: Certification[] }) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [thumbWidth, setThumbWidth] = useState(50);
  const displayCerts = certifications || [];

  const checkScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(Math.ceil(scrollLeft + clientWidth) < scrollWidth);
      
      const maxScroll = scrollWidth - clientWidth;
      setScrollProgress(maxScroll > 0 ? scrollLeft / maxScroll : 0);
      setThumbWidth(Math.min(100, (clientWidth / scrollWidth) * 100));
    }
  };

  useEffect(() => {
    const timer = setTimeout(checkScroll, 100);
    window.addEventListener('resize', checkScroll);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', checkScroll);
    };
  }, [displayCerts]);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const { scrollLeft, clientWidth } = scrollContainerRef.current;
      const scrollTo = direction === 'left' ? scrollLeft - clientWidth : scrollLeft + clientWidth;
      scrollContainerRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

  const getIssuerStyle = (issuer: string, index: number) => {
    const lower = issuer.toLowerCase();
    if (lower.includes('aws') || lower.includes('amazon')) {
      return { icon: <Award className="w-8 h-8 text-[#FF9900]" />, bg: "bg-[#FF9900]/10", border: "group-hover:border-[#FF9900]/50" };
    }
    if (lower.includes('google')) {
      return { icon: <Award className="w-8 h-8 text-[#4285F4]" />, bg: "bg-[#4285F4]/10", border: "group-hover:border-[#4285F4]/50" };
    }
    if (lower.includes('meta')) {
      return { icon: <Award className="w-8 h-8 text-[#0668E1]" />, bg: "bg-[#0668E1]/10", border: "group-hover:border-[#0668E1]/50" };
    }
    if (lower.includes('hackathon') || lower.includes('devpost')) {
      return { icon: <Trophy className="w-8 h-8 text-yellow-400" />, bg: "bg-yellow-400/10", border: "group-hover:border-yellow-400/50" };
    }
    
    // Default rotating icons based on index so each certificate gets a unique visual
    const defaultStyles = [
      { icon: <Medal className="w-8 h-8 text-blue-400" />, bg: "bg-blue-400/10", border: "group-hover:border-blue-400/50" },
      { icon: <Trophy className="w-8 h-8 text-emerald-400" />, bg: "bg-emerald-400/10", border: "group-hover:border-emerald-400/50" },
      { icon: <Award className="w-8 h-8 text-purple-400" />, bg: "bg-purple-400/10", border: "group-hover:border-purple-400/50" },
      { icon: <Star className="w-8 h-8 text-amber-400" />, bg: "bg-amber-400/10", border: "group-hover:border-amber-400/50" },
      { icon: <Crown className="w-8 h-8 text-rose-400" />, bg: "bg-rose-400/10", border: "group-hover:border-rose-400/50" },
      { icon: <Shield className="w-8 h-8 text-cyan-400" />, bg: "bg-cyan-400/10", border: "group-hover:border-cyan-400/50" }
    ];
    
    return defaultStyles[index % defaultStyles.length];
  }

  return (
    <section id="certifications" className="py-24 relative z-10 bg-slate-900/20">
      <div className="container mx-auto px-6 md:px-12 max-w-6xl">
        <SectionHeader 
          title="Certifications & Awards" 
          centered
          subtitle={
            <span 
              className="inline-block mt-4 text-xl md:text-2xl text-blue-400/90 rotate-2 drop-shadow-md tracking-wide"
              style={{ fontFamily: 'var(--font-caveat), cursive' }}
            >
              receipts of my skills.
            </span>
          } 
        />
        
        <div className="mt-16 relative group/carousel">
          
          <div 
            ref={scrollContainerRef}
            onScroll={checkScroll}
            className="flex overflow-x-auto snap-x snap-mandatory gap-6 pb-8 -mb-8 items-stretch [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
          >

          {displayCerts.map((cert, index) => {
            const style = getIssuerStyle(cert.issuer, index);
            
            return (
              <motion.div
                key={cert.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={`w-full md:w-[calc(50%-12px)] shrink-0 snap-start glass-card p-7 rounded-2xl flex flex-col h-auto relative group transition-all duration-500 hover:-translate-y-2 border border-white/5 bg-gradient-to-br from-white/[0.05] to-transparent hover:shadow-2xl hover:shadow-primary/20 overflow-hidden ${style.border}`}
              >
                {/* Sweeping shine effect on hover */}
                <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent group-hover:animate-[shimmer_1.5s_ease-in-out_1] pointer-events-none" />

                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 shadow-lg transition-transform duration-500 group-hover:scale-110 ${style.bg}`}>
                  <div className="scale-100">
                    {style.icon}
                  </div>
                </div>
                
                <h3 className="text-xl font-bold text-slate-100 mb-1.5 leading-tight transition-colors duration-300">
                  {cert.name}
                </h3>
                
                <p className="text-sm font-semibold text-primary/80 mb-auto tracking-wide uppercase">
                  {cert.issuer}
                </p>
                
                <div className="mt-5 flex-1 relative z-10">
                  {cert.description && (
                    <p className="text-sm text-slate-400 leading-relaxed">
                      {cert.description}
                    </p>
                  )}
                </div>
                
                <div className="mt-8 pt-5 border-t border-white/10 flex items-center justify-between gap-3 relative z-10 group-hover:border-primary/20 transition-colors duration-500">
                  <div className="flex items-center text-xs font-semibold text-slate-400 bg-white/5 px-3 py-1.5 rounded-full border border-white/5 group-hover:bg-primary/10 group-hover:text-primary/80 group-hover:border-primary/20 transition-all duration-500">
                    <Calendar className="w-3.5 h-3.5 mr-1.5" />
                    <span>{formatDate(cert.date)}</span>
                  </div>
                  
                  {cert.linkedin_url && (
                    <a 
                      href={cert.linkedin_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-500/10 text-xs font-semibold text-blue-400 hover:bg-blue-500 hover:text-white transition-all duration-300"
                    >
                      <span>Verify</span>
                      <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="currentColor">
                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                      </svg>
                    </a>
                  )}
                </div>
                
                {/* Subtle spotlight effect on hover */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
              </motion.div>
            );
          })}
          </div>
          
          {/* Centralized Glassmorphic Control Pill */}
          {displayCerts.length > 1 && (
            <div className="mt-12 flex justify-center">
              <div className="flex items-center gap-6 px-6 py-3 rounded-full bg-slate-800/40 border border-white/10 backdrop-blur-md shadow-[0_0_20px_rgba(0,0,0,0.2)]">
                <button 
                  onClick={() => scroll('left')}
                  disabled={!canScrollLeft}
                  className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-slate-400 transition-all cursor-pointer disabled:cursor-default"
                  aria-label="Previous certifications"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                
                <div className="text-sm font-bold tracking-[0.2em] text-white flex items-center">
                  <span className="text-primary w-5 text-center">
                    0{Math.round(scrollProgress * (displayCerts.length - 1)) + 1}
                  </span>
                  <span className="text-slate-500 mx-3 font-normal opacity-50">/</span>
                  <span className="text-slate-400 w-5 text-center">
                    0{displayCerts.length}
                  </span>
                </div>
                
                <button 
                  onClick={() => scroll('right')}
                  disabled={!canScrollRight}
                  className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-slate-400 transition-all cursor-pointer disabled:cursor-default"
                  aria-label="Next certifications"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
