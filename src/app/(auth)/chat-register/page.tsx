'use client'

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { signup } from "@/actions/auth"
import { useActionState } from "react"

export default function RegisterPage() {
  const [state, formAction, isPending] = useActionState(signup, { error: '' })

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950 p-4">
      <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-900/50 p-8 shadow-2xl backdrop-blur-xl">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-white">Create an Account</h1>
          <p className="mt-2 text-sm text-zinc-400">Join to start chatting in real-time</p>
        </div>

        <form action={formAction} className="space-y-4">
          {state?.error && (
            <div className="p-3 text-sm text-red-500 bg-red-500/10 border border-red-500/20 rounded-md">
              {state.error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-300" htmlFor="name">
                Full Name
              </label>
              <Input
                id="name"
                name="name"
                type="text"
                placeholder="John Doe"
                required
                className="border-zinc-800 bg-zinc-950 text-white placeholder:text-zinc-500 focus-visible:ring-blue-500"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-300" htmlFor="username">
                Username
              </label>
              <Input
                id="username"
                name="username"
                type="text"
                placeholder="johndoe123"
                required
                className="border-zinc-800 bg-zinc-950 text-white placeholder:text-zinc-500 focus-visible:ring-blue-500"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-300" htmlFor="password">
              Password
            </label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="••••••••"
              required
              minLength={6}
              className="border-zinc-800 bg-zinc-950 text-white placeholder:text-zinc-500 focus-visible:ring-blue-500"
            />
          </div>

          <Button type="submit" disabled={isPending} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 mt-4 disabled:opacity-50">
            {isPending ? "Signing up..." : "Sign Up"}
          </Button>
        </form>

        <div className="mt-6 text-center text-sm text-zinc-400">
          Already have an account?{" "}
          <Link href="/chat-login" className="text-blue-500 hover:text-blue-400 font-medium transition-colors">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  )
}
