"use client"

import { motion } from "framer-motion"
import { Calendar, Briefcase, GraduationCap, CheckCircle2 } from "lucide-react"
import { SectionHeader } from "../ui/section-header"
import { TechIcon } from "../ui/tech-icon"

export interface Experience {
  id: string;
  role: string;
  company: string;
  start_date: string | null;
  end_date: string | null;
  description: string;
  technologies?: string | null;
  icon: string;
}

const iconMap: Record<string, any> = {
  Briefcase,
  GraduationCap
}

const formatDate = (dateString: string | null) => {
  if (!dateString) return 'Present';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' });
};

export function ExperienceSection({ experiences }: { experiences: Experience[] }) {
  return (
    <section id="experience" className="py-24 relative z-10">
      <div className="container mx-auto px-6 md:px-12 max-w-5xl">
        <SectionHeader 
          title="Experience" 
          centered
          subtitle={
            <span 
              className="inline-block mt-4 text-xl md:text-2xl text-blue-400/90 -rotate-2 drop-shadow-md tracking-wide"
              style={{ fontFamily: 'var(--font-caveat), cursive' }}
            >
              Learning beyond the classroom.
            </span>
          } 
        />
        
        <div className="mt-16 relative">
          {/* Timeline vertical line */}
          <div className="absolute left-0 md:left-1/2 top-0 bottom-0 w-px bg-border -translate-x-1/2 hidden md:block" />
          
          <div className="space-y-12">
            {experiences.map((exp, index) => (
              <motion.div
                key={exp.id}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false, margin: "-100px" }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className={`flex flex-col md:flex-row relative gap-8 md:gap-0 ${
                  index % 2 === 0 ? "md:flex-row-reverse" : ""
                }`}
              >
                {/* Timeline dot */}
                <div className="hidden md:flex absolute left-1/2 top-0 -translate-x-1/2 w-12 h-12 rounded-full bg-background border-4 border-primary items-center justify-center z-10">
                  {(() => {
                    const Icon = iconMap[exp.icon] || Briefcase;
                    return <Icon size={20} className="text-primary" />;
                  })()}
                </div>
                
                {/* Content */}
                <div className={`md:w-1/2 ${index % 2 === 0 ? "md:pl-16" : "md:pr-16 text-left"}`}>
                  <div className="glass-card p-8 rounded-2xl relative group hover:border-primary/50 transition-colors">
                    {/* Mobile Icon */}
                    <div className="md:hidden w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4 text-primary">
                      {(() => {
                        const Icon = iconMap[exp.icon] || Briefcase;
                        return <Icon size={20} />;
                      })()}
                    </div>
                    
                    <div className="flex items-center gap-2 text-primary font-semibold mb-3 justify-start md:justify-start bg-primary/10 w-fit px-3 py-1.5 rounded-full text-sm">
                      <Calendar size={14} />
                      <span>
                        {exp.start_date ? `${formatDate(exp.start_date)} - ` : ''} 
                        {formatDate(exp.end_date)}
                      </span>
                    </div>
                    
                    <h3 className="text-2xl font-bold mb-1 text-slate-100">{exp.role}</h3>
                    <h4 className="text-lg text-primary/80 font-medium mb-6">{exp.company}</h4>
                    
                    <ul className="space-y-3 text-left">
                      {exp.description.split('\n').map((line, i) => {
                        const trimmed = line.trim();
                        if (!trimmed) return null;
                        
                        if (trimmed.startsWith('•') || trimmed.startsWith('-')) {
                          return (
                            <li key={i} className="flex items-start gap-3 text-muted-foreground group-hover:text-slate-300 transition-colors">
                              <span className="mt-2 w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0 shadow-[0_0_8px_rgba(var(--primary),0.8)]"></span>
                              <span className="leading-relaxed">{trimmed.substring(1).trim()}</span>
                            </li>
                          );
                        }
                        return (
                          <li key={i} className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                            {trimmed}
                          </li>
                        );
                      })}
                    </ul>
                    
                    {exp.technologies && (
                      <div className="mt-6 flex flex-wrap gap-2">
                        {exp.technologies.split(',').map((tech, i) => (
                          <span key={i} className="flex items-center gap-1.5 px-3 py-1 bg-primary/10 text-primary border border-primary/20 rounded-full text-xs font-medium">
                            <TechIcon name={tech.trim()} className="w-3.5 h-3.5" />
                            {tech.trim()}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
