'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

// --- PROJECTS ---

export async function createProject(formData: FormData) {
  const supabase = await createClient()
  
  const tagsString = formData.get('tags') as string
  const tags = tagsString ? tagsString.split(',').map(t => t.trim()) : []
  
  const data = {
    title: formData.get('title') as string,
    description: formData.get('description') as string,
    image_url: formData.get('image_url') as string,
    live_url: formData.get('live_url') as string,
    github_url: formData.get('github_url') as string,
    is_published: formData.get('is_published') === 'on',
    order_index: Number(formData.get('order_index') || 0),
    tags
  }

  const { error } = await supabase.from('projects').insert([data])
  
  if (error) throw new Error(error.message)
  
  revalidatePath('/', 'layout')
  redirect('/admin/projects')
}

export async function updateProject(id: string, formData: FormData) {
  const supabase = await createClient()
  
  const tagsString = formData.get('tags') as string
  const tags = tagsString ? tagsString.split(',').map(t => t.trim()) : []
  
  const data = {
    title: formData.get('title') as string,
    description: formData.get('description') as string,
    image_url: formData.get('image_url') as string,
    live_url: formData.get('live_url') as string,
    github_url: formData.get('github_url') as string,
    is_published: formData.get('is_published') === 'on',
    order_index: Number(formData.get('order_index') || 0),
    tags
  }

  const { error } = await supabase.from('projects').update(data).eq('id', id)
  
  if (error) throw new Error(error.message)
  
  revalidatePath('/', 'layout')
  redirect('/admin/projects')
}

export async function deleteProject(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('projects').delete().eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/', 'layout')
}

// --- SKILLS ---

export async function createSkill(formData: FormData) {
  const supabase = await createClient()
  
  const data = {
    name: formData.get('name') as string,
    category: formData.get('category') as string,
    icon: formData.get('icon') as string,
    order_index: Number(formData.get('order_index') || 0)
  }

  const { error } = await supabase.from('skills').insert([data])
  if (error) throw new Error(error.message)
  
  revalidatePath('/', 'layout')
  redirect('/admin/skills')
}

export async function updateSkill(id: string, formData: FormData) {
  const supabase = await createClient()
  
  const data = {
    name: formData.get('name') as string,
    category: formData.get('category') as string,
    icon: formData.get('icon') as string,
  }

  const { error } = await supabase.from('skills').update(data).eq('id', id)
  if (error) throw new Error(error.message)
  
  revalidatePath('/', 'layout')
  redirect('/admin/skills')
}

export async function deleteSkill(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('skills').delete().eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/', 'layout')
}

export async function updateSkillsOrder(updates: { id: string, order_index: number }[]) {
  const supabase = await createClient()
  
  // Supabase doesn't have a built-in bulk update for different values yet in the standard client,
  // so we'll do this as a Promise.all of individual updates for small datasets like skills.
  const promises = updates.map(update => 
    supabase.from('skills').update({ order_index: update.order_index }).eq('id', update.id)
  )
  
  const results = await Promise.all(promises)
  const error = results.find(r => r.error)?.error
  if (error) throw new Error(error.message)
  
  revalidatePath('/', 'layout')
}

// --- EXPERIENCE ---

export async function createExperience(formData: FormData) {
  const supabase = await createClient()
  
  const data = {
    role: formData.get('role') as string,
    company: formData.get('company') as string,
    start_date: formData.get('start_date') as string || null,
    end_date: formData.get('end_date') as string || null,
    description: formData.get('description') as string,
    icon: formData.get('icon') as string
  }

  const { error } = await supabase.from('experience').insert([data])
  if (error) throw new Error(error.message)
  
  revalidatePath('/', 'layout')
  redirect('/admin/experience')
}

export async function updateExperience(id: string, formData: FormData) {
  const supabase = await createClient()
  
  const data = {
    role: formData.get('role') as string,
    company: formData.get('company') as string,
    start_date: formData.get('start_date') as string || null,
    end_date: formData.get('end_date') as string || null,
    description: formData.get('description') as string,
    icon: formData.get('icon') as string
  }

  const { error } = await supabase.from('experience').update(data).eq('id', id)
  if (error) throw new Error(error.message)
  
  revalidatePath('/', 'layout')
  redirect('/admin/experience')
}

export async function deleteExperience(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('experience').delete().eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/', 'layout')
}
