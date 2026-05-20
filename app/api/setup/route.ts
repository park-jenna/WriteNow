import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { saveResumeFileId } from "@/lib/supabase"
import { errDetail, devPayload } from "@/lib/errors"

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const body = await req.json()
    const { fileId } = body

    if (!fileId || typeof fileId !== "string") {
      return NextResponse.json({ error: "fileId is required" }, { status: 400 })
    }

    await saveResumeFileId(session.user.email, fileId)
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("[api/setup]", err)
    return NextResponse.json(
      { error: "Failed to save file ID", ...devPayload(errDetail(err)) },
      { status: 500 }
    )
  }
}
