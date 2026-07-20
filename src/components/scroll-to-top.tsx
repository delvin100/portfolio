"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowUp } from "lucide-react"

export function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > 500) {
        setIsVisible(true)
      } else {
        setIsVisible(false)
      }
    }

    window.addEventListener("scroll", toggleVisibility)
    return () => window.removeEventListener("scroll", toggleVisibility)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    })
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 20 }}
          className="hidden md:flex fixed bottom-8 right-8 z-50"
        >
          <button
            onClick={scrollToTop}
            className="group flex items-center justify-center w-12 h-12 rounded-full bg-white/5 backdrop-blur-md border border-white/10 text-slate-300 hover:bg-primary/20 hover:border-primary/50 hover:text-primary transition-all duration-300 shadow-lg hover:shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:-translate-y-1"
            aria-label="Scroll to top"
          >
            <ArrowUp size={20} strokeWidth={2.5} className="group-hover:-translate-y-1 transition-transform duration-300" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
