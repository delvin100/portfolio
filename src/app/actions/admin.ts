'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function deleteUser(userId: string, formData?: FormData) {
  try {
    // First delete from public.User (Prisma table)
    await prisma.user.delete({
      where: { id: userId },
    })
    
    // Then delete from Supabase Auth (auth.users) using a raw SQL query
    // This works because the connection uses the 'postgres' superuser role
    await prisma.$executeRawUnsafe(`DELETE FROM auth.users WHERE id = $1::uuid`, userId)
    revalidatePath('/admin/users')
    return { success: true }
  } catch (error) {
    console.error("Failed to delete user:", error)
    return { error: 'Failed to delete user' }
  }
}

export async function updateUser(userId: string, data: { name: string, username: string }) {
  try {
    // Validate inputs
    if (!data.name.trim() || !data.username.trim()) {
      return { error: 'Name and username are required' }
    }

    await prisma.user.update({
      where: { id: userId },
      data: {
        name: data.name.trim(),
        username: data.username.trim(),
      },
    })
    
    revalidatePath('/admin/users')
    return { success: true }
  } catch (error: any) {
    console.error("Failed to update user:", error)
    if (error.code === 'P2002') {
      return { error: 'Username already taken' }
    }
    return { error: 'Failed to update user' }
  }
}

export async function clearPageViews() {
  try {
    // @ts-ignore - Prisma client needs regeneration to pick up the PageView model type
    await prisma.pageView.deleteMany({})
    revalidatePath('/admin')
    return { success: true }
  } catch (error) {
    console.error("Failed to clear page views:", error)
    return { error: 'Failed to clear page views' }
  }
}
