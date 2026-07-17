'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'

type ActionState = { error: string }

export async function login(prevState: ActionState, formData: FormData): Promise<ActionState> {
  const supabase = await createClient()

  // type-casting here for convenience
  // in practice, you should validate your inputs
  const rawUsername = formData.get('username') as string
  const username = rawUsername.trim().toLowerCase()
  const password = formData.get('password') as string
  
  // Ensure the prefix is valid for an email (no spaces or weird characters)
  const safeEmailPrefix = username.replace(/[^a-z0-9_.-]/g, '')
  const email = `${safeEmailPrefix}@example.com`

  const data = {
    email,
    password,
  }

  const { error } = await supabase.auth.signInWithPassword(data)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/', 'layout')
  redirect('/chat')
}

export async function signup(prevState: ActionState, formData: FormData): Promise<ActionState> {
  const supabase = await createClient()

  const rawUsername = formData.get('username') as string
  const username = rawUsername.trim().toLowerCase()
  
  // Ensure the prefix is valid for an email (no spaces or weird characters)
  const safeEmailPrefix = username.replace(/[^a-z0-9_.-]/g, '')
  const email = `${safeEmailPrefix}@example.com`

  // Check if username is already taken in Prisma
  const existingUser = await prisma.user.findUnique({
    where: { username }
  })
  
  if (existingUser) {
    return { error: "Username is already taken. Please choose another one." }
  }

  const data = {
    email,
    password: formData.get('password') as string,
    name: formData.get('name') as string,
    username,
  }

  // 1. Create the user in Supabase Auth
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: data.email,
    password: data.password,
  })

  if (authError) {
    return { error: authError.message }
  }

  if (authData.user) {
    try {
      // 2. Create the user in Prisma (our public schema)
      await prisma.user.create({
        data: {
          id: authData.user.id,
          name: data.name,
          username: data.username,
        }
      })
    } catch (dbError: any) {
      // Handle unique username conflict or other DB errors
      return { error: "Failed to create user profile. Username might be taken." }
    }
  }

  revalidatePath('/', 'layout')
  redirect('/chat')
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/chat-login')
}


