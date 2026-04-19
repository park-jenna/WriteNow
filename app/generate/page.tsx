"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import StepTracker, { type Step } from "@/components/StepTracker"
import CoverLetterOutput from "@/components/CoverLetterOutput"

const INITIAL_STEPS: Step[] = [
  { label: "Fetching your resume", status: "pending" },
  { label: "Researching company", status: "pending" },
  { label: "Writing cover letter", status: "pending" },
  { label: "Saving to Drive", status: "pending" },
  { label: "Logging to Notion", status: "pending" },
]

export default function GeneratePage() {
  const router = useRouter()
  const [steps, setSteps] = useState<Step[]>(INITIAL_STEPS)
  const [result, setResult] = useState<{
    coverLetter: string
    driveUrl: string | null
    notionUrl: string | null
    warnings: string[]
  } | null>(null)
  const [error, setError] = useState("")
  const [setupHint, setSetupHint] = useState(false)

  function updateStep(index: number, status: Step["status"]) {
    setSteps((prev) => prev.map((s, i) => (i === index ? { ...s, status } : s)))
  }

  useEffect(() => {
    let cancelled = false

    async function run() {
      const raw = sessionStorage.getItem("generateInput")
      if (!raw) {
        setError("No input found. Please go back and fill out the form.")
        return
      }

      let input: Record<string, string>
      try {
        input = JSON.parse(raw) as Record<string, string>
      } catch {
        setError("Invalid form data. Please go back and try again.")
        return
      }

      updateStep(0, "running")
      updateStep(1, "running")

      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      })

      const data = (await res.json()) as {
        error?: string
        detail?: string
        coverLetter?: string
        driveUrl?: string | null
        notionUrl?: string | null
        warnings?: string[]
      }

      if (cancelled) return

      if (!res.ok) {
        if (data.error === "No resume file configured") {
          setSetupHint(true)
        }
        const msg =
          data.detail && data.error
            ? `${data.error} (${data.detail})`
            : data.error || "Something went wrong."
        setError(msg)
        updateStep(0, "error")
        updateStep(1, "error")
        return
      }

      updateStep(0, "done")
      updateStep(1, "done")
      updateStep(2, "running")

      updateStep(2, "done")
      updateStep(3, data.driveUrl ? "done" : "error")
      updateStep(4, data.notionUrl ? "done" : "error")

      setResult({
        coverLetter: data.coverLetter ?? "",
        driveUrl: data.driveUrl ?? null,
        notionUrl: data.notionUrl ?? null,
        warnings: data.warnings ?? [],
      })
    }

    void run()
    return () => {
      cancelled = true
    }
  }, [])

  if (error) {
    return (
      <main className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center px-4 py-10">
        <div className="flex max-w-md flex-col items-center gap-3 text-center">
          <p className="text-sm text-red-500">{error}</p>
          {setupHint && (
            <a href="/setup" className="text-sm underline">
              Configure your resume
            </a>
          )}
          <button
            type="button"
            onClick={() => router.push("/")}
            className="text-sm underline"
          >
            Go back
          </button>
        </div>
      </main>
    )
  }

  return (
    <main className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center px-4 py-10">
      <div className="w-full max-w-2xl">
        {!result ? (
          <div className="flex flex-col gap-6">
            <h1 className="text-xl font-semibold">Generating your cover letter…</h1>
            <StepTracker steps={steps} />
          </div>
        ) : (
          <CoverLetterOutput
            coverLetter={result.coverLetter}
            driveUrl={result.driveUrl}
            notionUrl={result.notionUrl}
            warnings={result.warnings}
          />
        )}
      </div>
    </main>
  )
}
