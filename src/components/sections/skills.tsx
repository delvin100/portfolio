"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { SectionHeader } from "../ui/section-header"
import { 
  Code2, 
  Database, 
  Layout, 
  Terminal,
  type LucideIcon
} from "lucide-react"
import Image from "next/image"

export interface SkillCategory {
  id: string;
  name: string;
  category: string;
  icon: string;
}

const iconMap: Record<string, LucideIcon> = {
  Database,
  Terminal,
  Layout,
  Code2,
}

// Group flat skills from DB into categories
function groupSkills(skills: SkillCategory[]) {
  const groups: Record<string, { title: string, icon: LucideIcon, skills: string[] }> = {}
  
  skills.forEach(skill => {
    if (!groups[skill.category]) {
      groups[skill.category] = {
        title: skill.category,
        icon: iconMap[skill.icon] || Code2,
        skills: []
      }
    }
    groups[skill.category].skills.push(skill.name)
  })
  
  return Object.values(groups)
}



const DinoAnimation = ({ posIndex, direction, columns }: { posIndex: number, direction: number, columns: number }) => {
  if (columns === 0) return null;

  // The CSS grid is always lg:grid-cols-4 when the dino is visible, so we divide by 4.
  const gridCols = 4;
  const leftPos = `calc(${(posIndex / gridCols) * 100}% + ${(100 / gridCols) / 2}% - 32px)`;

  return (
    <div className="absolute -top-14 left-0 w-full h-16 pointer-events-none hidden lg:block z-20">
      <motion.div
        className="absolute bottom-0 text-[2.5rem] leading-none z-10 text-slate-200"
        animate={{ left: leftPos }}
        transition={{ duration: 0.6, ease: "linear" }}
      >
        <motion.div
          key={posIndex} // Force re-animation on position change
          initial={{ y: 0, scaleX: direction }}
          animate={{ y: [0, -45, 0], scaleX: direction }}
          transition={{
            y: { duration: 0.6, ease: ["easeOut", "easeIn"] },
            scaleX: { duration: 0.1 }
          }}
        >
          <Image src="/download-removebg-preview.png" alt="Running Dino" width={64} height={64} className="w-16 h-16 object-contain invert opacity-90" />
        </motion.div>
      </motion.div>
    </div>
  )
}

export function SkillsSection({ skills }: { skills: SkillCategory[] }) {
  const skillCategories = groupSkills(skills)
  const cardCount = skillCategories.length
  const columns = Math.min(cardCount, 4)

  const [dinoPos, setDinoPos] = useState(0)
  const [dinoDirection, setDinoDirection] = useState<1 | -1>(1)
  const [landedIndex, setLandedIndex] = useState(-1) // -1 means in the air or starting

  useEffect(() => {
    if (columns <= 1) return;
    
    let currentPos = 0;
    let direction = 1;
    
    // Initial landing effect for the first card after the first jump in place
    const initialTimer = setTimeout(() => {
      if (typeof window !== 'undefined' && window.innerWidth >= 1024) {
        setLandedIndex(0);
      }
    }, 600);
    
    const interval = setInterval(() => {
      if (typeof window !== 'undefined' && window.innerWidth < 1024) return;
      
      // Calculate next position
      if (direction === 1 && currentPos >= columns - 1) {
        direction = -1;
      } else if (direction === -1 && currentPos <= 0) {
        direction = 1;
      }
      
      currentPos += direction;
      
      setDinoDirection(direction as 1 | -1);
      setDinoPos(currentPos);
      
      // Clear the landed index during jump
      setLandedIndex(-1);
      
      // Set landed index after jump completes
      setTimeout(() => {
        setLandedIndex(currentPos);
      }, 600);
      
    }, 1500); // Jump every 1.5 seconds
    
    return () => {
      clearInterval(interval);
      clearTimeout(initialTimer);
    };
  }, [columns]);

  return (
    <section id="skills" className="py-24 relative z-10">
      <div className="container mx-auto px-6 md:px-12">
        <SectionHeader 
          title="My Skills" 
          subtitle={
            <span 
              className="inline-block mt-4 text-xl md:text-2xl text-blue-400/90 -rotate-2 drop-shadow-md tracking-wide"
              style={{ fontFamily: 'var(--font-caveat), cursive' }}
            >
              the tools I use to cook fr.
            </span>
          } 
          centered 
        />
        
        <div className="relative mt-20">
          <DinoAnimation posIndex={dinoPos} direction={dinoDirection} columns={columns} />
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {skillCategories.map((category, index) => (
            <motion.div
              key={category.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, margin: "-50px" }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="relative p-[1px] rounded-3xl group"
            >
              {/* Outer border gradient that shows on hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 rounded-3xl transition-opacity duration-500" />
              
              {/* Inner glowing shadow */}
              <div className="absolute -inset-[1px] bg-gradient-to-r from-blue-500/0 via-indigo-500/10 to-blue-500/0 rounded-3xl opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-700" />
              
              {/* Dino Landed Flash Effect */}
              <motion.div 
                animate={landedIndex === index ? { opacity: [0, 0.4, 0] } : { opacity: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="absolute inset-0 bg-primary/20 rounded-3xl blur-xl z-0 pointer-events-none hidden lg:block" 
              />
              
              {/* Card Content with Press Animation */}
              <motion.div 
                animate={landedIndex === index ? { y: [0, 6, 0], scale: [1, 0.98, 1] } : { y: 0, scale: 1 }}
                transition={{ duration: 0.4, ease: "easeInOut" }}
                className="relative h-full bg-surface/50 backdrop-blur-xl border border-border/50 rounded-3xl p-8 hover:bg-surface/80 transition-colors duration-500 flex flex-col z-10 overflow-hidden shadow-2xl"
              >
                
                <div className="relative z-10 flex flex-col h-full">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mb-8 border border-primary/10 shadow-[0_0_15px_rgba(var(--primary),0.1)] group-hover:shadow-[0_0_25px_rgba(var(--primary),0.2)] transition-shadow">
                    <category.icon size={28} className="text-primary" />
                  </div>
                  
                  <h3 className="text-2xl font-bold mb-8 tracking-tight text-foreground/90 group-hover:text-foreground transition-colors">{category.title}</h3>
                  
                  <div className="flex flex-wrap gap-2.5 mt-auto">
                    {category.skills.map((skill, i) => (
                      <motion.span
                        key={skill}
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: false }}
                        transition={{ delay: 0.3 + (i * 0.05) }}
                        className="inline-flex items-center px-4 py-1.5 text-sm font-medium rounded-full bg-white/5 text-slate-300 border border-white/10 hover:bg-primary/20 hover:text-primary hover:border-primary/30 transition-all duration-300 shadow-sm hover:shadow-primary/20 cursor-default"
                      >
                        {skill}
                      </motion.span>
                    ))}
                  </div>
                </div>
              </motion.div>
            </motion.div>
          ))}
          </div>
        </div>
      </div>
    </section>
  )
}
