import { NextResponse } from "next/server"
import { isJobApiError, retryVideoSplitJob } from "@/lib/videosplit/queue"

export const maxDuration = 60

export async function POST(_request: Request, context: { params: Promise<{ id: string }> }) {
  const params = await context.params

  try {
    const job = await retryVideoSplitJob(params.id)
    return NextResponse.json(
      { job },
      {
        status: 202,
        headers: {
          "Cache-Control": "no-store",
        },
      }
    )
  } catch (error) {
    if (isJobApiError(error)) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }
    console.error("Failed to retry VideoSplit job:", error)
    return NextResponse.json({ error: "Failed to retry job." }, { status: 500 })
  }
}
