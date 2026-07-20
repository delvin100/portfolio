'use client'

import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { login } from '@/app/actions/auth'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, Eye, EyeOff, ArrowLeft } from 'lucide-react'

const formSchema = z.object({
  email: z.string().email({ message: 'Invalid email address' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
})

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true)
    setError(null)
    
    const formData = new FormData()
    formData.append('email', values.email)
    formData.append('password', values.password)
    
    const result = await login(formData)
    
    if (result?.error) {
      setError(result.error)
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4 relative overflow-hidden bg-[#030303]">
      {/* Huge ambient background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-[800px] h-[600px] bg-primary/10 blur-[150px] rounded-full pointer-events-none" />
      
      <div className="relative w-full max-w-md group">
        {/* Holographic Window Ripples matching Hero section */}
        <motion.div 
          animate={{ scale: [1, 1.05], opacity: [0.5, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeOut" }}
          className="absolute inset-0 rounded-2xl border-2 border-primary/40 pointer-events-none z-[1]"
        />
        <motion.div 
          animate={{ scale: [1, 1.05], opacity: [0.5, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeOut", delay: 2.5 }}
          className="absolute inset-0 rounded-2xl border-2 border-emerald-500/30 pointer-events-none z-[1]"
        />

        {/* Background glow behind card */}
        <div className="absolute -inset-2 bg-gradient-to-r from-primary to-emerald-400 rounded-2xl blur-xl opacity-20 group-hover:opacity-40 transition duration-1000 z-[0]" />
        
        <Card className="relative z-10 w-full bg-[#050505]/90 backdrop-blur-xl border-white/10 shadow-2xl rounded-2xl overflow-hidden p-[1px]">
          {/* Animated top edge glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-[1px] bg-gradient-to-r from-transparent via-primary to-transparent opacity-50" />
          
          <CardHeader className="space-y-3 text-center pb-8 pt-10">
            <div className="mx-auto w-14 h-14 bg-white/5 rounded-full flex items-center justify-center mb-2 border border-white/10 shadow-[inset_0_0_15px_rgba(255,255,255,0.05)] relative">
              <div className="absolute inset-0 rounded-full border border-primary/40 animate-[spin_4s_linear_infinite]" style={{ borderTopColor: 'transparent', borderRightColor: 'transparent' }} />
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            </div>
            <CardTitle className="text-3xl font-black tracking-tighter text-white">Admin Access</CardTitle>
            <CardDescription className="text-slate-400 font-light text-base">
              Enter your credentials to access the dashboard
            </CardDescription>
          </CardHeader>
          <CardContent className="pb-10 px-8">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-300 font-mono text-[10px] uppercase tracking-wider">Email</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="admin@example.com" 
                          type="email" 
                          autoComplete="email" 
                          disabled={isLoading} 
                          {...field} 
                          className="bg-white/5 border-white/10 text-white placeholder:text-slate-600 focus-visible:ring-primary/50 focus-visible:border-primary/50 transition-colors h-12 rounded-lg"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-300 font-mono text-[10px] uppercase tracking-wider">Password</FormLabel>
                      <div className="relative">
                        <FormControl>
                          <Input 
                            placeholder="••••••••" 
                            type={showPassword ? "text" : "password"} 
                            autoComplete="current-password" 
                            disabled={isLoading} 
                            {...field} 
                            className="bg-white/5 border-white/10 text-white placeholder:text-slate-600 focus-visible:ring-primary/50 focus-visible:border-primary/50 transition-colors h-12 rounded-lg pr-12"
                          />
                        </FormControl>
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-primary transition-colors p-1"
                          tabIndex={-1}
                        >
                          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {error && (
                  <div className="text-sm font-medium text-red-400 bg-red-400/10 border border-red-400/20 p-3 rounded-lg text-center">
                    {error}
                  </div>
                )}
                
                <Button 
                  type="submit" 
                  className="w-full relative overflow-hidden group bg-primary hover:bg-primary/90 text-primary-foreground font-bold mt-6 transition-all active:scale-[0.98] h-12 rounded-lg" 
                  disabled={isLoading}
                >
                  <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out pointer-events-none" />
                  <span className="relative z-10 flex items-center justify-center text-black">
                    {isLoading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
                    Sign In
                  </span>
                </Button>
              </form>
            </Form>
            
            <div className="mt-8 flex justify-center">
              <Link 
                href="/" 
                className="p-3 bg-white/5 rounded-full border border-white/10 hover:border-primary/50 hover:bg-primary/10 hover:text-primary text-slate-400 transition-all duration-300 group"
                aria-label="Back to Portfolio"
              >
                <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
