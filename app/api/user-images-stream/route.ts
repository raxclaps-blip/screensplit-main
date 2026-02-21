import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const email = searchParams.get('email')
  
  if (!email) {
    return new Response(JSON.stringify({ error: "Email parameter is required" }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    })
  }

  // Set up SSE headers
  const encoder = new TextEncoder()
  const stream = new ReadableStream({
    async start(controller) {
      const sendUpdate = async () => {
        try {
          // Find the user
          const user = await prisma.user.findUnique({
            where: { email }
          })

          if (user) {
            // Fetch latest public projects
            const projects = await prisma.project.findMany({
              where: {
                userId: user.id,
                shareSlug: { not: null },
                isPublic: true
              },
              select: {
                id: true,
                title: true,
                shareSlug: true,
                createdAt: true,
                updatedAt: true,
              },
              orderBy: { createdAt: 'desc' },
              take: 20
            })

            // Send data as SSE event only if controller is still open
            if (controller.desiredSize !== null) {
              const data = `data: ${JSON.stringify({ projects, timestamp: Date.now() })}\n\n`
              controller.enqueue(encoder.encode(data))
            }
          }
        } catch (error) {
          console.error('SSE error:', error)
        }
      }

      // Send initial data
      await sendUpdate()

      // Poll for updates every 5 seconds
      const interval = setInterval(sendUpdate, 5000)

      // Cleanup on connection close
      req.signal.addEventListener('abort', () => {
        clearInterval(interval)
        controller.close()
      })
    }
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no', // Disable nginx buffering
    }
  })
}
