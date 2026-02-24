import { NextResponse } from "next/server"
import { getVideoSplitJobDownload, isJobApiError } from "@/lib/videosplit/queue"

export const maxDuration = 60

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const params = await context.params

  try {
    const result = await getVideoSplitJobDownload(params.id)
    const headers = new Headers({
      "Content-Type": "video/mp4",
      "Content-Disposition": `attachment; filename="videosplit-portrait-${Date.now()}.mp4"`,
      "Cache-Control": "no-store",
    })
    if (result.warnings.length > 0) {
      headers.set("x-videosplit-warning", result.warnings.join(" "))
    }
    return new NextResponse(result.bytes, { status: 200, headers })
  } catch (error) {
    if (isJobApiError(error)) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }
    console.error("Failed to download VideoSplit job output:", error)
    return NextResponse.json({ error: "Failed to fetch rendered video." }, { status: 500 })
  }
}
