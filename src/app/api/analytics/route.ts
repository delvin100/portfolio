import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { path, userAgent } = body

    if (!path) {
      return NextResponse.json({ error: 'Path is required' }, { status: 400 })
    }

    // Filter out paths that shouldn't be tracked (like admin, api, static files, etc)
    if (
      path.startsWith('/admin') ||
      path.startsWith('/api') ||
      path.startsWith('/_next') ||
      path.includes('.') // skip files like .png, .ico, etc
    ) {
      return NextResponse.json({ success: true, ignored: true })
    }

    await prisma.pageView.create({
      data: {
        path,
        userAgent: userAgent || 'Unknown',
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to log page view:', error)
    return NextResponse.json({ error: 'Failed to log view' }, { status: 500 })
  }
}
