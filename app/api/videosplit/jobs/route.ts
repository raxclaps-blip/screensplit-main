import { NextResponse } from "next/server"
import { createVideoSplitJob, isJobApiError } from "@/lib/videosplit/queue"

export const maxDuration = 300

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const before = formData.get("before")
    const after = formData.get("after")
    const controlsRaw = formData.get("controls")

    if (!(before instanceof File) || !(after instanceof File)) {
      return NextResponse.json({ error: "Both before and after video files are required." }, { status: 400 })
    }

    let parsedControls: unknown = {}
    if (typeof controlsRaw === "string") {
      try {
        parsedControls = JSON.parse(controlsRaw)
      } catch {
        return NextResponse.json({ error: "Invalid controls payload." }, { status: 400 })
      }
    }

    const job = await createVideoSplitJob({
      before,
      after,
      controlsRaw: parsedControls,
    })

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
    console.error("Failed to create VideoSplit job:", error)
    if (isJobApiError(error)) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }
    return NextResponse.json({ error: "Failed to enqueue render job." }, { status: 500 })
  }
}
