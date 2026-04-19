import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { getResumeFileId } from "@/lib/supabase"
import { fetchResumeText, saveCoverLetter } from "@/lib/drive"
import { researchCompany, generateCoverLetter } from "@/lib/anthropic"
import { logToNotion } from "@/lib/notion"

function errDetail(err: unknown): string {
  if (err instanceof Error) return err.message
  if (typeof err === "string") return err
  if (
    typeof err === "object" &&
    err !== null &&
    "message" in err &&
    typeof (err as { message: unknown }).message === "string"
  ) {
    return (err as { message: string }).message
  }
  return "Unknown error"
}

function devPayload(detail: string) {
  return process.env.NODE_ENV === "development" ? { detail } : {}
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email || !session.accessToken) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
  }

  const { jobTitle, companyName, jobDescription, personalNote } = await req.json()

  if (!jobTitle || !companyName) {
    return NextResponse.json(
      { error: "jobTitle and companyName are required" },
      { status: 400 }
    )
  }

  const fileId = await getResumeFileId(session.user.email)
  if (!fileId) {
    return NextResponse.json({ error: "No resume file configured" }, { status: 400 })
  }

  const [resumeOutcome, researchOutcome] = await Promise.allSettled([
    fetchResumeText(fileId, session.accessToken),
    researchCompany(companyName),
  ])

  if (resumeOutcome.status === "rejected") {
    console.error("Resume fetch failed:", resumeOutcome.reason)
    return NextResponse.json(
      {
        error:
          "Could not read your resume from Google Drive. Check the file link, permissions, and that you signed in with the same Google account that owns the file.",
        ...devPayload(errDetail(resumeOutcome.reason)),
      },
      { status: 500 }
    )
  }

  if (researchOutcome.status === "rejected") {
    console.error("Company research failed:", researchOutcome.reason)
    return NextResponse.json(
      {
        error: "Could not research the company (AI). Check ANTHROPIC_API_KEY and billing.",
        ...devPayload(errDetail(researchOutcome.reason)),
      },
      { status: 500 }
    )
  }

  const resumeText = resumeOutcome.value
  const companyResearch = researchOutcome.value

  let coverLetter: string
  try {
    coverLetter = await generateCoverLetter({
      jobTitle,
      companyName,
      companyResearch,
      resumeText,
      jobDescription: jobDescription || "",
      personalNote: personalNote || "",
    })
  } catch (err) {
    console.error("Cover letter generation failed:", err)
    return NextResponse.json(
      { error: "Failed to generate cover letter" },
      { status: 500 }
    )
  }

  const warnings: string[] = []

  let driveUrl: string | null = null
  try {
    const fileName = `Cover Letter — ${jobTitle} at ${companyName} — ${new Date().toLocaleDateString()}`
    driveUrl = await saveCoverLetter(coverLetter, fileName, session.accessToken)
  } catch (err) {
    console.error("Drive save failed:", err)
    warnings.push("Could not save to Google Drive")
  }

  let notionUrl: string | null = null
  try {
    notionUrl = await logToNotion({
      userEmail: session.user.email,
      jobTitle,
      companyName,
      driveUrl,
    })
  } catch (err) {
    console.error("Notion log failed:", err)
    const msg = err instanceof Error ? err.message : String(err)
    if (msg.includes("object_not_found") || msg.includes("Could not find database")) {
      warnings.push("Could not log to Notion: that database was not found for this integration.")
      warnings.push(
        "In Notion, open the database → ⋯ → Connections → add this workspace’s integration. Set NOTION_DATABASE_ID from that database’s URL (full-page database), not a parent page."
      )
    } else {
      warnings.push("Could not log to Notion")
    }
  }

  return NextResponse.json({
    coverLetter,
    driveUrl,
    notionUrl,
    warnings,
  })
}
