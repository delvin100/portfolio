"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { GitHubCalendar } from "react-github-calendar"
import { useTheme } from "next-themes"
import { GitFork, Users, BookOpen, ExternalLink } from "lucide-react"

interface GithubStatsProps {
  username: string
}

interface GithubUser {
  public_repos: number;
  followers: number;
  following: number;
  avatar_url: string;
  html_url: string;
  name: string;
  login: string;
}

export function GithubStats({ username }: GithubStatsProps) {
  const { theme, systemTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [userData, setUserData] = useState<GithubUser | null>(null)

  useEffect(() => {
    setMounted(true)
    
    // Fetch GitHub User Data
    const fetchGithubData = async () => {
      try {
        const res = await fetch(`https://api.github.com/users/${username}`)
        if (!res.ok) return
        const data = await res.json()
        if (!data.message) {
          setUserData(data)
        }
      } catch (err) {
        // Use console.warn instead of console.error to avoid Next.js dev overlay
        console.warn("Failed to fetch github data (possibly blocked by browser/adblocker)")
      }
    }
    
    fetchGithubData()
  }, [username])

  const currentTheme = theme === "system" ? systemTheme : theme

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-50px" }}
      className="w-full max-w-5xl mx-auto flex flex-col gap-6"
    >
      {/* Header / Profile Info */}
      <motion.div variants={itemVariants} className="flex items-center justify-between px-2">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full overflow-hidden bg-primary/10 border-2 border-primary/20 flex items-center justify-center p-0.5">
            {userData?.avatar_url ? (
              <img src={userData.avatar_url} alt={username} className="w-full h-full object-cover rounded-full" />
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-github text-primary"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/><path d="M9 18c-4.51 2-5-2-7-2"/></svg>
            )}
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-100 tracking-tight flex items-center gap-2">
              {userData?.name || "GitHub Contributions"}
            </h3>
            <a 
              href={userData?.html_url || `https://github.com/${username}`}
              target="_blank"
              rel="noreferrer"
              className="text-sm text-primary/80 hover:text-primary transition-colors flex items-center gap-1 font-mono mt-1"
            >
              @{userData?.login || username} <ExternalLink size={12} />
            </a>
          </div>
        </div>
      </motion.div>

      {/* Stats Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Repos Card */}
        <motion.div variants={itemVariants} className="glass-card p-6 rounded-2xl flex items-center justify-between gap-4 group hover:border-blue-500/30 transition-all cursor-default">
          <div>
            <p className="text-sm text-slate-400 font-medium mb-1">Public Repos</p>
            <p className="text-3xl font-bold text-slate-100 group-hover:text-blue-400 transition-colors">{userData?.public_repos || "-"}</p>
          </div>
          <div className="w-12 h-12 rounded-full bg-blue-500/10 text-blue-400 flex items-center justify-center group-hover:scale-110 transition-transform">
            <BookOpen size={24} />
          </div>
        </motion.div>

        {/* Followers Card */}
        <motion.div variants={itemVariants} className="glass-card p-6 rounded-2xl flex items-center justify-between gap-4 group hover:border-green-500/30 transition-all cursor-default">
          <div>
            <p className="text-sm text-slate-400 font-medium mb-1">Followers</p>
            <p className="text-3xl font-bold text-slate-100 group-hover:text-green-400 transition-colors">{userData?.followers || "-"}</p>
          </div>
          <div className="w-12 h-12 rounded-full bg-green-500/10 text-green-400 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Users size={24} />
          </div>
        </motion.div>

        {/* Following Card */}
        <motion.div variants={itemVariants} className="glass-card p-6 rounded-2xl flex items-center justify-between gap-4 group hover:border-purple-500/30 transition-all cursor-default">
          <div>
            <p className="text-sm text-slate-400 font-medium mb-1">Following</p>
            <p className="text-3xl font-bold text-slate-100 group-hover:text-purple-400 transition-colors">{userData?.following || "-"}</p>
          </div>
          <div className="w-12 h-12 rounded-full bg-purple-500/10 text-purple-400 flex items-center justify-center group-hover:scale-110 transition-transform">
            <GitFork size={24} />
          </div>
        </motion.div>
      </div>

      {/* Calendar Card */}
      <motion.div 
        variants={itemVariants}
        className="glass-card p-6 sm:p-8 rounded-2xl w-full flex flex-col items-center justify-center group hover:border-primary/30 transition-all relative overflow-hidden"
      >
        {/* Subtle glow behind calendar */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-primary/5 blur-[100px] rounded-full pointer-events-none" />
        
        <div className="overflow-x-auto w-full flex justify-center pb-2 min-h-[150px] relative z-10">
          {mounted && (
            <div className="relative z-10 scale-95 sm:scale-100 origin-center transition-transform">
              <GitHubCalendar 
                username={username}
                colorScheme={currentTheme === "light" ? "light" : "dark"}
                theme={{
                  light: ['#ebedf0', '#9be9a8', '#40c463', '#30a14e', '#216e39'],
                  dark: ['#161b22', '#0e4429', '#006d32', '#26a641', '#39d353'],
                }}
                fontSize={12}
                blockSize={12}
                blockMargin={4}
                blockRadius={2}
              />
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}
