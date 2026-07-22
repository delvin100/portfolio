"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { Mail, ArrowUpRight } from "lucide-react"
import { FaGithub, FaLinkedin } from "react-icons/fa"

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="relative bg-[#030303] pt-24 pb-8 overflow-hidden border-t border-white/5 font-sans">
      {/* Background Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent"></div>
      <motion.div 
        animate={{ scale: [1, 1.1, 1], opacity: [0.2, 0.4, 0.2] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -top-24 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary/20 blur-[150px] rounded-full pointer-events-none"
      ></motion.div>

      <div className="container mx-auto px-6 md:px-12 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-8 mb-12">
          
          {/* Brand & Intro */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-5 flex flex-col items-start"
          >
            <Link href="/" className="inline-block mb-6 group">
              <span className="text-4xl font-bold tracking-tighter text-white flex items-center gap-1">
                Delvin<span className="text-primary group-hover:rotate-12 transition-transform duration-300 inline-block">.</span>
              </span>
            </Link>
            <p className="text-zinc-400 text-lg leading-relaxed max-w-md mb-8">
              Crafting premium digital experiences through innovative code and bold design. Let's build something extraordinary together.
            </p>
            

          </motion.div>

          {/* Links Section */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="lg:col-span-3 lg:col-start-7 flex flex-col gap-4"
          >
            <h4 className="text-white font-semibold text-lg mb-4 flex items-center gap-2">
              Navigation
            </h4>
            <nav className="grid grid-cols-2 gap-y-3 gap-x-8">
              {['Home', 'About', 'Skills', 'Projects', 'Experience', 'Certifications'].map((item) => (
                <Link 
                  key={item} 
                  href={item === 'Home' ? '/' : `/#${item.toLowerCase()}`}
                  className="text-zinc-400 hover:text-white hover:translate-x-2 transition-all flex items-center gap-2 w-fit group"
                >
                  <ArrowUpRight className="w-3 h-3 opacity-0 -ml-5 group-hover:opacity-100 group-hover:ml-0 transition-all text-primary" />
                  {item}
                </Link>
              ))}
            </nav>
          </motion.div>

          {/* Socials */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="lg:col-span-3 flex flex-col gap-4"
          >
            <h4 className="text-white font-semibold text-lg mb-4">Connect</h4>
            <div className="flex flex-col gap-3">
              <a 
                href="https://github.com/delvin100" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-zinc-400 hover:text-white transition-colors flex items-center gap-4 group w-fit"
              >
                <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-primary group-hover:border-primary group-hover:text-black transition-all duration-300">
                  <FaGithub size={18} />
                </div>
                <span className="font-medium">GitHub</span>
              </a>
              <a 
                href="https://linkedin.com/in/delvinvarghese" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-zinc-400 hover:text-white transition-colors flex items-center gap-4 group w-fit"
              >
                <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-[#0077B5] group-hover:border-[#0077B5] group-hover:text-white transition-all duration-300">
                  <FaLinkedin size={18} />
                </div>
                <span className="font-medium">LinkedIn</span>
              </a>
            </div>
          </motion.div>
        </div>



        {/* Bottom Bar */}
        <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-white/10 gap-6 mt-8">
          <p className="text-sm text-zinc-500 font-mono flex items-center gap-2">
            &copy; {currentYear} Delvin Varghese. 
            <span className="hidden sm:inline">All rights reserved.</span>
          </p>
        </div>
      </div>
    </footer>
  )
}
