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
  let email = `${safeEmailPrefix}@example.com`

  // If the admin logs in through the chat, route it to their real email
  if (username === 'delvin') {
    email = 'delvinvarghese2028@mca.ajce.in'
  }

  const data = {
    email,
    password,
  }

  let authData, error;
  
  try {
    const response = await supabase.auth.signInWithPassword(data);
    authData = response.data;
    error = response.error;
  } catch (err: any) {
    console.error("Login exception:", err);
    return { error: "Network or server error during login. Please try again." }
  }

  if (error) {
    if (error.message === 'Invalid login credentials') {
      return { error: 'Invalid Login Credentials' }
    }
    return { error: error.message }
  }

  if (authData.user) {
    try {
      await prisma.user.upsert({
        where: { id: authData.user.id },
        update: { status: 'Online' },
        create: {
          id: authData.user.id,
          name: username,
          username: username,
          status: 'Online'
        }
      })
    } catch (e) {
      console.error("Failed to update status on login", e)
    }
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
  let authData, authError;
  try {
    const response = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
    });
    authData = response.data;
    authError = response.error;
  } catch (err: any) {
    console.error("Signup exception:", err);
    return { error: "Network or server error during signup. Please try again." }
  }

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
          status: 'Online',
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
  
  try {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (user) {
      try {
        await prisma.user.update({
          where: { id: user.id },
          data: { status: 'Offline', lastSeen: new Date() }
        })
      } catch (e) {
        console.error("Failed to update status on logout", e)
      }
    }

    await supabase.auth.signOut()
  } catch (err) {
    console.error("Logout network error:", err)
    // Even if Supabase network fails, we should clear the cookies by calling signOut if possible,
    // but signOut also makes a network request. If it fails, we still want to redirect.
  }

  redirect('/chat-login')
}


