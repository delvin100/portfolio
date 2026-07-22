"use client"

import { useState, useEffect, useRef } from "react"
import { motion, useInView } from "framer-motion"
import { Send, MapPin, Mail, MessageSquare } from "lucide-react"
import { FaGithub, FaLinkedin } from "react-icons/fa"
import { SectionHeader } from "../ui/section-header"
import Link from "next/link"

function TypewriterBubble({ text, startDelay }: { text: string, startDelay: number }) {
  const [displayedText, setDisplayedText] = useState("");
  const [phase, setPhase] = useState<"idle" | "typing_indicator" | "typing_text" | "done">("idle");
  const ref = useRef(null);
  const inView = useInView(ref, { margin: "-100px" });
  const hasStarted = useRef(false);

  useEffect(() => {
    if (inView && !hasStarted.current) {
      hasStarted.current = true;
      let timeouts: NodeJS.Timeout[] = [];
      let interval: NodeJS.Timeout;

      // Start typing indicator
      timeouts.push(setTimeout(() => setPhase("typing_indicator"), startDelay));
      
      // After 0.8 seconds, switch to typing text
      timeouts.push(setTimeout(() => {
        setPhase("typing_text");
        let i = 0;
        interval = setInterval(() => {
          i++;
          setDisplayedText(text.slice(0, i));
          if (i >= text.length) {
            clearInterval(interval);
            // Keep the cursor blinking for half a second before finishing
            timeouts.push(setTimeout(() => setPhase("done"), 500));
          }
        }, 30); // 30ms per character for a realistic typing speed
      }, startDelay + 800)); 

      return () => {
        timeouts.forEach(clearTimeout);
        if (interval) clearInterval(interval);
      };
    } else if (!inView && hasStarted.current) {
      // Reset when scrolled out of view
      hasStarted.current = false;
      setPhase("idle");
      setDisplayedText("");
    }
  }, [inView, startDelay, text]);

  return (
    <div ref={ref} className="flex flex-col min-h-[44px] justify-end">
      {phase === "typing_indicator" && (
        <motion.div
          initial={{ opacity: 0, y: 10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          className="flex items-end gap-2"
        >
          <div className="bg-secondary/20 border border-secondary/30 px-4 py-3 rounded-2xl rounded-bl-sm shadow-sm backdrop-blur-sm flex items-center gap-1.5 h-[44px]">
            <span className="w-1.5 h-1.5 bg-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
            <span className="w-1.5 h-1.5 bg-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
            <span className="w-1.5 h-1.5 bg-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
          </div>
        </motion.div>
      )}

      {(phase === "typing_text" || phase === "done") && (
        <motion.div
          initial={{ opacity: 0, y: 10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          className="flex items-end gap-2"
        >
          <div className="bg-secondary/20 border border-secondary/30 text-foreground px-4 py-3 rounded-2xl rounded-bl-sm max-w-[85%] text-sm shadow-sm backdrop-blur-sm">
            {displayedText}
            {phase === "typing_text" && (
              <span className="inline-block w-[2px] h-3.5 ml-1 bg-primary animate-pulse align-middle"></span>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
}

export function ContactSection() {
  return (
    <section id="contact" className="py-24 relative z-10">
      <div className="container mx-auto px-6 md:px-12 max-w-6xl">
        <SectionHeader title="Get In Touch" subtitle="Have a project in mind? Let's work together." />
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mt-16">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: false, margin: "-100px" }}
            transition={{ duration: 0.5 }}
          >
            <h3 className="text-3xl font-bold mb-6">Let's talk about your project</h3>
            <p className="text-muted-foreground text-lg mb-10">
              Whether you have a question, a project idea, or just want to say hi, 
              feel free to jump into the live chat to reach me directly, or use the 
              contact details below!
            </p>
            
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <Mail size={24} />
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">Email</h4>
                  <a href="mailto:delvin2862005@gmail.com" className="text-lg hover:text-primary transition-colors interactive">
                    delvin2862005@gmail.com
                  </a>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <MapPin size={24} />
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">Location</h4>
                  <p className="text-lg">Kerala, India</p>
                </div>
              </div>
            </div>
            
            <div className="mt-12">
              <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider mb-4">Follow Me</h4>
              <div className="flex gap-4">
                <a
                  href="https://github.com/delvin100"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-12 h-12 rounded-full glass flex items-center justify-center hover:text-primary hover:border-primary/50 transition-all hover:scale-110 interactive"
                >
                  <FaGithub size={20} />
                </a>
                <a
                  href="https://linkedin.com/in/delvinvarghese"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-12 h-12 rounded-full glass flex items-center justify-center hover:text-primary hover:border-primary/50 transition-all hover:scale-110 interactive"
                >
                  <FaLinkedin size={20} />
                </a>
              </div>
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: false, margin: "-100px" }}
            transition={{ duration: 0.5 }}
            className="h-full flex flex-col justify-center"
          >
            <div className="glass-card rounded-2xl flex flex-col overflow-hidden border border-border/50 relative group shadow-2xl shadow-primary/5">
              {/* Chat Header */}
              <div className="p-4 border-b border-border/50 bg-background/50 backdrop-blur-md flex items-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center overflow-hidden">
                    <img src="/profile.jpg" alt="Delvin" className="w-full h-full object-cover" />
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-sm">Delvin Varghese</h4>
                </div>
              </div>

              {/* Chat Messages */}
              <div className="p-6 flex flex-col gap-4 min-h-[250px] bg-background/20 justify-start">
                <TypewriterBubble 
                  text="Hey there! 👋" 
                  startDelay={500} 
                />
                <TypewriterBubble 
                  text="I built a custom real-time chat app so we don't have to use emails. Click below and type a message to start a conversation!" 
                  startDelay={2000} 
                />
              </div>

              {/* Chat Input (Action Button) */}
              <div className="p-4 bg-background/50 backdrop-blur-md border-t border-border/50">
                <Link 
                  href="/chat"
                  className="w-full bg-background/80 hover:bg-background border border-border/80 rounded-full px-5 py-3 flex items-center justify-between text-muted-foreground hover:text-foreground transition-all group-hover:border-primary/50 group-hover:shadow-[0_0_15px_rgba(var(--primary),0.2)] cursor-pointer interactive"
                >
                  <span className="text-sm">Type a message...</span>
                  <div className="bg-primary/20 text-primary w-8 h-8 rounded-full flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                    <Send size={14} className="-ml-[1px]" />
                  </div>
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
