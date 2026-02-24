import { NextResponse } from "next/server"
import { getVideoSplitJobAsync } from "@/lib/videosplit/queue"

export const maxDuration = 60

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const params = await context.params
  const job = await getVideoSplitJobAsync(params.id)

  if (!job) {
    return NextResponse.json({ error: "Job not found." }, { status: 404 })
  }

  return NextResponse.json(
    { job },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    }
  )
}
