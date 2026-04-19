import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { saveResumeFileId } from "@/lib/supabase"

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
    const detail =
      err instanceof Error
        ? err.message
        : typeof err === "string"
          ? err
          : typeof err === "object" &&
              err !== null &&
              "message" in err &&
              typeof (err as { message: unknown }).message === "string"
            ? (err as { message: string }).message
            : "Unknown error"
    return NextResponse.json(
      {
        error: "Failed to save file ID",
        ...(process.env.NODE_ENV === "development" ? { detail } : {}),
      },
      { status: 500 }
    )
  }
}
