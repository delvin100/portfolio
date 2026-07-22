"use client"

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

export function AnalyticsTracker() {
  const pathname = usePathname()

  useEffect(() => {
    // Only track visits to the main portfolio page (root). Ignore /chat, /admin, etc.
    if (pathname !== '/') return

    const trackView = async () => {
      try {
        await fetch('/api/analytics', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            path: pathname,
            userAgent: navigator.userAgent,
          }),
        })
      } catch (error) {
        // Silently fail to not disrupt user experience
        console.warn('Analytics tracking failed')
      }
    }

    trackView()
  }, [pathname])

  return null
}
