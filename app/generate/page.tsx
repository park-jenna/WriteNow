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

type FormInput = {
  jobTitle: string
  companyName: string
  jobDescription: string
  personalNote: string
}

export default function GeneratePage() {
  const router = useRouter()
  const [steps, setSteps] = useState<Step[]>(INITIAL_STEPS)
  const [meta, setMeta] = useState<{ jobTitle: string; companyName: string } | null>(null)
  const [result, setResult] = useState<{
    coverLetter: string
    driveUrl: string | null
    notionUrl: string | null
    warnings: string[]
    jobTitle: string
    companyName: string
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
        router.push("/?error=no-input")
        return
      }

      let input: FormInput
      try {
        input = JSON.parse(raw) as FormInput
      } catch {
        setError("Invalid form data. Please go back and try again.")
        return
      }

      if (!input.jobTitle || !input.companyName) {
        router.push("/?error=no-input")
        return
      }

      setMeta({ jobTitle: input.jobTitle, companyName: input.companyName })

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
        jobTitle: input.jobTitle,
        companyName: input.companyName,
      })
    }

    void run()
    return () => {
      cancelled = true
    }
  }, [router])

  if (error) {
    return (
      <main className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center px-4 py-10">
        <div className="glass-card flex max-w-md flex-col items-center gap-3 p-8 text-center">
          <p className="text-sm" style={{ color: "var(--error)" }}>
            {error}
          </p>
          {setupHint && (
            <a href="/setup" className="btn-ghost text-xs">
              Configure your resume
            </a>
          )}
          <button type="button" className="btn-ghost text-xs" onClick={() => router.push("/")}>
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
          <div className="mx-auto w-full max-w-[480px] px-6 py-6">
            <p
              className="mb-2 text-xs uppercase tracking-[0.06em]"
              style={{ color: "var(--text-muted)" }}
            >
              Generating
            </p>
            <h1
              className="mb-10 text-3xl font-semibold tracking-tight"
              style={{ letterSpacing: "-0.03em" }}
            >
              {meta?.companyName ?? "…"}
            </h1>
            <div className="glass-card p-7">
              <StepTracker steps={steps} />
            </div>
          </div>
        ) : (
          <CoverLetterOutput
            jobTitle={result.jobTitle}
            companyName={result.companyName}
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
