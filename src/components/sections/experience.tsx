"use client"

import { motion } from "framer-motion"
import { Calendar, Briefcase, GraduationCap } from "lucide-react"
import { SectionHeader } from "../ui/section-header"

export interface Experience {
  id: string;
  role: string;
  company: string;
  start_date: string | null;
  end_date: string | null;
  description: string;
  icon: string;
}

const iconMap: Record<string, any> = {
  Briefcase,
  GraduationCap
}

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
              where I've been leveling up irl.
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
                <div className={`md:w-1/2 ${index % 2 === 0 ? "md:pl-16" : "md:pr-16 text-left md:text-right"}`}>
                  <div className="glass-card p-8 rounded-2xl relative group hover:border-primary/50 transition-colors">
                    {/* Mobile Icon */}
                    <div className="md:hidden w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4 text-primary">
                      {(() => {
                        const Icon = iconMap[exp.icon] || Briefcase;
                        return <Icon size={20} />;
                      })()}
                    </div>
                    
                    <div className="flex items-center gap-2 text-primary font-semibold mb-2 justify-start md:justify-start">
                      <Calendar size={16} />
                      <span>
                        {exp.start_date ? new Date(exp.start_date).getFullYear() : ''} 
                        {exp.end_date ? ` - ${new Date(exp.end_date).getFullYear()}` : ' - Present'}
                      </span>
                    </div>
                    
                    <h3 className="text-2xl font-bold mb-1">{exp.role}</h3>
                    <h4 className="text-lg text-muted-foreground mb-4">{exp.company}</h4>
                    
                    <p className="text-muted-foreground leading-relaxed">
                      {exp.description}
                    </p>
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
