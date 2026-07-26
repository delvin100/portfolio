'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'

type SettingsActionState = { error?: string, success?: string }

export async function updateUserSettings(prevState: SettingsActionState, formData: FormData): Promise<SettingsActionState> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: "You must be logged in to update settings." }
  }

  const rawUsername = formData.get('username') as string
  const username = rawUsername.trim().toLowerCase()
  const name = formData.get('name') as string
  const currentPassword = formData.get('currentPassword') as string
  const newPassword = formData.get('newPassword') as string
  const confirmPassword = formData.get('confirmPassword') as string

  if (newPassword || currentPassword || confirmPassword) {
    if (!currentPassword) {
      return { error: "Current password is required to set a new password." }
    }
    if (!newPassword || newPassword.length < 6) {
      return { error: "New password must be at least 6 characters long." }
    }
    if (newPassword !== confirmPassword) {
      return { error: "New password and confirm password do not match." }
    }
    
    // Verify current password by attempting to sign in
    // user.email will be present because we generated it on signup
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user.email!,
      password: currentPassword
    })

    if (signInError) {
      return { error: "Incorrect current password." }
    }

    // Current password is correct, update the password
    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword
    })

    if (updateError) {
      return { error: `Failed to update password: ${updateError.message}` }
    }
  }

  // Update Username and Name
  // First, check if the username is changing
  const dbUser = await prisma.user.findUnique({ where: { id: user.id } })
  if (!dbUser) {
    return { error: "User not found in database." }
  }

  if (username !== dbUser.username) {
    // Check if new username is taken
    const existing = await prisma.user.findUnique({ where: { username } })
    if (existing) {
      return { error: "Username is already taken." }
    }

    // Update email in Supabase auth to match the new username
    const safeEmailPrefix = username.replace(/[^a-z0-9_.-]/g, '')
    const newEmail = `${safeEmailPrefix}@example.com`
    
    const { error: emailUpdateError } = await supabase.auth.updateUser({
      email: newEmail
    })
    
    if (emailUpdateError) {
      return { error: `Failed to update auth email: ${emailUpdateError.message}` }
    }
  }

  // Finally, update Prisma record
  try {
    await prisma.user.update({
      where: { id: user.id },
      data: {
        name,
        username
      }
    })
  } catch (error) {
    return { error: "Failed to update profile in database." }
  }

  revalidatePath('/chat')
  return { success: "Settings updated successfully!" }
}
