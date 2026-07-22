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
  
  const hideGithub = formData.get('hide_github_link') === 'on'
  let githubUrl = formData.get('github_url') as string
  if (githubUrl) {
    if (hideGithub && !githubUrl.startsWith('HIDE_')) {
      githubUrl = `HIDE_${githubUrl}`
    } else if (!hideGithub && githubUrl.startsWith('HIDE_')) {
      githubUrl = githubUrl.replace(/^HIDE_/, '')
    }
  }

  const data = {
    title: formData.get('title') as string,
    description: formData.get('description') as string,
    image_url: await handleProjectImageUpload(formData),
    live_url: formData.get('live_url') as string,
    github_url: githubUrl,
    is_published: formData.get('is_published') === 'on',
    order_index: Number(formData.get('order_index') || 0),
    tags
  }

  const { error } = await supabase.from('projects').insert([data])
  
  if (error) throw new Error(error.message)
  
  revalidatePath('/', 'layout')
  redirect('/admin/projects?success=project_added')
}

export async function updateProject(id: string, formData: FormData) {
  const supabase = await createClient()
  
  const tagsString = formData.get('tags') as string
  const tags = tagsString ? tagsString.split(',').map(t => t.trim()) : []
  
  const hideGithub = formData.get('hide_github_link') === 'on'
  let githubUrl = formData.get('github_url') as string
  if (githubUrl) {
    if (hideGithub && !githubUrl.startsWith('HIDE_')) {
      githubUrl = `HIDE_${githubUrl}`
    } else if (!hideGithub && githubUrl.startsWith('HIDE_')) {
      githubUrl = githubUrl.replace(/^HIDE_/, '')
    }
  }

  const data = {
    title: formData.get('title') as string,
    description: formData.get('description') as string,
    image_url: await handleProjectImageUpload(formData),
    live_url: formData.get('live_url') as string,
    github_url: githubUrl,
    is_published: formData.get('is_published') === 'on',
    order_index: Number(formData.get('order_index') || 0),
    tags
  }

  const { error } = await supabase.from('projects').update(data).eq('id', id)
  
  if (error) throw new Error(error.message)
  
  revalidatePath('/', 'layout')
  redirect('/admin/projects?success=project_updated')
}

export async function toggleProjectPublishStatus(id: string, is_published: boolean) {
  const supabase = await createClient()
  
  const { error } = await supabase.from('projects').update({ is_published }).eq('id', id)
  if (error) throw new Error(error.message)
  
  revalidatePath('/', 'layout')
}

export async function deleteProject(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('projects').delete().eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/', 'layout')
}

export async function deleteProjects(ids: string[]) {
  const supabase = await createClient()
  const { error } = await supabase.from('projects').delete().in('id', ids)
  if (error) throw new Error(error.message)
  revalidatePath('/', 'layout')
}

export async function updateProjectsOrder(updates: { id: string, order_index: number }[]) {
  const supabase = await createClient()
  const promises = updates.map(update => 
    supabase.from('projects').update({ order_index: update.order_index }).eq('id', update.id)
  )
  const results = await Promise.all(promises)
  const error = results.find(r => r.error)?.error
  if (error) throw new Error(error.message)
  revalidatePath('/', 'layout')
}

// --- UTILS ---

async function handleIconUpload(formData: FormData) {
  const iconType = formData.get('icon_type') as string
  if (iconType !== 'upload') return formData.get('icon_value') as string

  const file = formData.get('icon_file') as File
  if (!file || file.size === 0) return formData.get('icon_value') as string

  const supabase = await createClient()
  const fileExt = file.name.split('.').pop()
  const originalName = file.name.replace(`.${fileExt}`, '').replace(/[^a-zA-Z0-9_ -]/g, '')
  const fileName = `${originalName}_${Date.now()}.${fileExt}`

  const { error } = await supabase.storage
    .from('portfolio_icons')
    .upload(fileName, file)

  if (error) throw new Error(`Upload failed: ${error.message}`)
  
  const { data: { publicUrl } } = supabase.storage
    .from('portfolio_icons')
    .getPublicUrl(fileName)

  return publicUrl
}

async function handleProjectImageUpload(formData: FormData) {
  const imageType = formData.get('image_type') as string
  if (imageType !== 'upload') return formData.get('image_url') as string

  const file = formData.get('image_file') as File
  if (!file || file.size === 0) return formData.get('image_url') as string

  const supabase = await createClient()
  const fileExt = file.name.split('.').pop()
  const originalName = file.name.replace(`.${fileExt}`, '').replace(/[^a-zA-Z0-9_ -]/g, '')
  const fileName = `projects/${originalName}_${Date.now()}.${fileExt}`

  // Using portfolio_icons bucket to avoid needing to create a new public bucket
  const { error } = await supabase.storage
    .from('portfolio_icons')
    .upload(fileName, file)

  if (error) throw new Error(`Upload failed: ${error.message}`)
  
  const { data: { publicUrl } } = supabase.storage
    .from('portfolio_icons')
    .getPublicUrl(fileName)

  return publicUrl
}

// --- CATEGORIES ---

export async function createCategory(formData: FormData) {
  const supabase = await createClient()
  
  const data = {
    name: formData.get('name') as string,
    icon_type: formData.get('icon_type') as string,
    icon: await handleIconUpload(formData),
  }

  const { error } = await supabase.from('skill_categories').insert([data])
  if (error) throw new Error(error.message)
  
  revalidatePath('/', 'layout')
  redirect('/admin/skills?success=category_added')
}

export async function updateCategory(id: string, formData: FormData) {
  const supabase = await createClient()
  
  const data = {
    name: formData.get('name') as string,
    icon_type: formData.get('icon_type') as string,
    icon: await handleIconUpload(formData),
  }

  const { error } = await supabase.from('skill_categories').update(data).eq('id', id)
  if (error) throw new Error(error.message)
  
  revalidatePath('/', 'layout')
  redirect('/admin/skills?success=category_updated')
}

export async function deleteCategory(id: string) {
  const supabase = await createClient()
  
  // Delete all skills in this category first
  const { error: skillsError } = await supabase.from('skills').delete().eq('category_id', id)
  if (skillsError) throw new Error(skillsError.message)
  
  // Delete the category itself
  const { error } = await supabase.from('skill_categories').delete().eq('id', id)
  if (error) throw new Error(error.message)
  
  revalidatePath('/', 'layout')
}

export async function deleteCategories(ids: string[]) {
  const supabase = await createClient()
  
  // Delete all skills in these categories first
  const { error: skillsError } = await supabase.from('skills').delete().in('category_id', ids)
  if (skillsError) throw new Error(skillsError.message)
  
  // Delete the categories
  const { error } = await supabase.from('skill_categories').delete().in('id', ids)
  if (error) throw new Error(error.message)
  
  revalidatePath('/', 'layout')
}

export async function updateCategoriesOrder(updates: { id: string, order_index: number }[]) {
  const supabase = await createClient()
  const promises = updates.map(update => 
    supabase.from('skill_categories').update({ order_index: update.order_index }).eq('id', update.id)
  )
  const results = await Promise.all(promises)
  const error = results.find(r => r.error)?.error
  if (error) throw new Error(error.message)
  revalidatePath('/', 'layout')
}

// --- SKILLS ---

export async function createSkill(formData: FormData) {
  const supabase = await createClient()
  
  const data = {
    name: formData.get('name') as string,
    category_id: formData.get('category_id') as string,
    icon_type: formData.get('icon_type') as string,
    icon: await handleIconUpload(formData),
  }

  const { error } = await supabase.from('skills').insert([data])
  if (error) throw new Error(error.message)
  
  revalidatePath('/', 'layout')
  redirect('/admin/skills?success=skill_added')
}

export async function updateSkill(id: string, formData: FormData) {
  const supabase = await createClient()
  
  const data = {
    name: formData.get('name') as string,
    category_id: formData.get('category_id') as string,
    icon_type: formData.get('icon_type') as string,
    icon: await handleIconUpload(formData),
  }

  const { error } = await supabase.from('skills').update(data).eq('id', id)
  if (error) throw new Error(error.message)
  
  revalidatePath('/', 'layout')
  redirect('/admin/skills?success=skill_updated')
}

export async function deleteSkill(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('skills').delete().eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/', 'layout')
}

export async function deleteSkills(ids: string[]) {
  const supabase = await createClient()
  const { error } = await supabase.from('skills').delete().in('id', ids)
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
    technologies: formData.get('technologies') as string || null,
    icon: formData.get('icon') as string
  }

  const { error } = await supabase.from('experience').insert([data])
  if (error) throw new Error(error.message)
  
  revalidatePath('/', 'layout')
  redirect('/admin/experience?success=experience_added')
}

export async function updateExperience(id: string, formData: FormData) {
  const supabase = await createClient()
  
  const data = {
    role: formData.get('role') as string,
    company: formData.get('company') as string,
    start_date: formData.get('start_date') as string || null,
    end_date: formData.get('end_date') as string || null,
    description: formData.get('description') as string,
    technologies: formData.get('technologies') as string || null,
    icon: formData.get('icon') as string
  }

  const { error } = await supabase.from('experience').update(data).eq('id', id)
  if (error) throw new Error(error.message)
  
  revalidatePath('/', 'layout')
  redirect('/admin/experience?success=experience_updated')
}

export async function deleteExperience(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('experience').delete().eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/', 'layout')
}

export async function deleteExperiences(ids: string[]) {
  const supabase = await createClient()
  const { error } = await supabase.from('experience').delete().in('id', ids)
  if (error) throw new Error(error.message)
  revalidatePath('/', 'layout')
}

export async function updateExperiencesOrder(updates: { id: string, order_index: number }[]) {
  const supabase = await createClient()
  const promises = updates.map(update => 
    supabase.from('experience').update({ order_index: update.order_index }).eq('id', update.id)
  )
  const results = await Promise.all(promises)
  const error = results.find(r => r.error)?.error
  if (error) throw new Error(error.message)
  revalidatePath('/', 'layout')
}

// --- SETTINGS ---

export async function getSettings() {
  const supabase = await createClient()
  const { data, error } = await supabase.from('settings').select('*')
  if (error) return {}
  
  const settings: Record<string, string> = {}
  data.forEach((row: any) => {
    settings[row.key] = row.value
  })
  return settings
}

export async function updateSetting(key: string, value: string) {
  const supabase = await createClient()
  
  // Check if exists
  const { data } = await supabase.from('settings').select('id').eq('key', key).single()
  
  if (data) {
    const { error } = await supabase.from('settings').update({ value }).eq('key', key)
    if (error) throw new Error(error.message)
  } else {
    const { error } = await supabase.from('settings').insert([{ key, value }])
    if (error) throw new Error(error.message)
  }
  
  revalidatePath('/', 'layout')
}

export async function uploadSettingFile(formData: FormData) {
  const supabase = await createClient()
  
  const file = formData.get('file') as File
  const key = formData.get('key') as string
  
  if (!file || file.size === 0) throw new Error("No file provided")
  if (!key) throw new Error("No key provided")

  const fileExt = file.name.split('.').pop()
  const fileName = `settings/${key}_${Date.now()}.${fileExt}`

  const { error } = await supabase.storage
    .from('portfolio_icons')
    .upload(fileName, file)

  if (error) throw new Error(`Upload failed: ${error.message}`)
  
  const { data: { publicUrl } } = supabase.storage
    .from('portfolio_icons')
    .getPublicUrl(fileName)

  await updateSetting(key, publicUrl)
  
  return publicUrl
}
// --- CERTIFICATIONS ---

export async function createCertification(formData: FormData) {
  const supabase = await createClient()
  
  const data = {
    name: formData.get('name') as string,
    issuer: formData.get('issuer') as string,
    date: formData.get('date') ? formData.get('date') as string : null,
    description: formData.get('description') as string,
    linkedin_url: formData.get('linkedin_url') as string,
    order_index: Number(formData.get('order_index') || 0),
  }

  const { error } = await supabase.from('certifications').insert([data])
  if (error) throw new Error(error.message)
  
  revalidatePath('/', 'layout')
  redirect('/admin/certifications?success=certification_added')
}

export async function updateCertification(id: string, formData: FormData) {
  const supabase = await createClient()
  
  const data = {
    name: formData.get('name') as string,
    issuer: formData.get('issuer') as string,
    date: formData.get('date') ? formData.get('date') as string : null,
    description: formData.get('description') as string,
    linkedin_url: formData.get('linkedin_url') as string,
    order_index: Number(formData.get('order_index') || 0),
  }

  const { error } = await supabase.from('certifications').update(data).eq('id', id)
  if (error) throw new Error(error.message)
  
  revalidatePath('/', 'layout')
  redirect('/admin/certifications?success=certification_updated')
}

export async function deleteCertification(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('certifications').delete().eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/', 'layout')
}

export async function deleteCertifications(ids: string[]) {
  const supabase = await createClient()
  const { error } = await supabase.from('certifications').delete().in('id', ids)
  if (error) throw new Error(error.message)
  revalidatePath('/', 'layout')
}

export async function updateCertificationsOrder(items: { id: string, order_index: number }[]) {
  const supabase = await createClient()
  
  for (const item of items) {
    const { error } = await supabase.from('certifications').update({ order_index: item.order_index }).eq('id', item.id)
    if (error) throw new Error(error.message)
  }
  
  revalidatePath('/', 'layout')
}
