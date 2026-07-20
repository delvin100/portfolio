'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
})

export async function login(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const parsed = loginSchema.safeParse({ email, password })

  if (!parsed.success) {
    return { error: 'Invalid email or password format.' }
  }

  const supabase = await createClient()

  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  })

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/', 'layout')
  redirect('/admin')
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  
  revalidatePath('/', 'layout')
  redirect('/login')
}

const emailSchema = z.object({
  email: z.string().email(),
})

const passwordSchema = z.object({
  password: z.string().min(6),
})

export async function updateAccountEmail(formData: FormData) {
  const email = formData.get('email') as string
  const parsed = emailSchema.safeParse({ email })

  if (!parsed.success) {
    throw new Error('Invalid email format.')
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.updateUser({ email: parsed.data.email })

  if (error) {
    throw new Error(error.message)
  }

  return { success: true }
}

export async function updateAccountPassword(formData: FormData) {
  const password = formData.get('password') as string
  const parsed = passwordSchema.safeParse({ password })

  if (!parsed.success) {
    throw new Error('Password must be at least 6 characters.')
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.updateUser({ password: parsed.data.password })

  if (error) {
    throw new Error(error.message)
  }

  return { success: true }
}

export async function getCurrentUser() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user ? { email: user.email, id: user.id } : null
}
