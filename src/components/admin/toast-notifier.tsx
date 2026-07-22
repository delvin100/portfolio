"use client"

import { useEffect } from "react"
import { useSearchParams, useRouter, usePathname } from "next/navigation"
import { toast } from "sonner"

export function ToastNotifier() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const success = searchParams.get("success")
    if (success) {
      if (success === "skill_added") {
        toast.success("Skill added successfully")
      } else if (success === "skill_updated") {
        toast.success("Skill updated successfully")
      } else if (success === "category_added") {
        toast.success("Category added successfully")
      } else if (success === "category_updated") {
        toast.success("Category updated successfully")
      } else if (success === "project_added") {
        toast.success("Project added successfully")
      } else if (success === "project_updated") {
        toast.success("Project updated successfully")
      } else if (success === "experience_added") {
        toast.success("Experience added successfully")
      } else if (success === "experience_updated") {
        toast.success("Experience updated successfully")
      } else if (success === "certification_added") {
        toast.success("Certification added successfully")
      } else if (success === "certification_updated") {
        toast.success("Certification updated successfully")
      }

      // Remove the query param from the URL so it doesn't fire again on refresh
      const newSearchParams = new URLSearchParams(searchParams.toString())
      newSearchParams.delete("success")
      const newUrl = `${pathname}${newSearchParams.toString() ? `?${newSearchParams.toString()}` : ''}`
      
      // Use window.history.replaceState to avoid triggering a Next.js route change
      window.history.replaceState({}, '', newUrl)
    }
  }, [searchParams, pathname])

  return null
}
