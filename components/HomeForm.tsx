"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

export default function HomeForm() {
  const [form, setForm] = useState({
    jobTitle: "",
    companyName: "",
    jobDescription: "",
    personalNote: "",
  })
  const [submitting, setSubmitting] = useState(false)
  const router = useRouter()

  function handleSubmit() {
    if (!form.jobTitle || !form.companyName) return
    setSubmitting(true)
    sessionStorage.setItem("generateInput", JSON.stringify(form))
    router.push("/generate")
  }

  return (
    <main className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center px-4 py-10">
      <div className="flex w-full max-w-lg flex-col gap-5 rounded-xl border border-border bg-card p-10 shadow-sm">
        <h1 className="text-xl font-semibold">Generate a cover letter</h1>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium">Job Title *</label>
          <input
            value={form.jobTitle}
            onChange={(e) => setForm({ ...form, jobTitle: e.target.value })}
            placeholder="Software Engineer"
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium">Company Name *</label>
          <input
            value={form.companyName}
            onChange={(e) => setForm({ ...form, companyName: e.target.value })}
            placeholder="Anthropic"
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium">
            Job Description{" "}
            <span className="font-normal text-muted-foreground">(optional)</span>
          </label>
          <textarea
            value={form.jobDescription}
            onChange={(e) => setForm({ ...form, jobDescription: e.target.value })}
            placeholder="Paste the full job description here..."
            rows={4}
            className="resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium">
            Personal Note{" "}
            <span className="font-normal text-muted-foreground">(optional)</span>
          </label>
          <textarea
            value={form.personalNote}
            onChange={(e) => setForm({ ...form, personalNote: e.target.value })}
            placeholder="Anything you want to highlight — relevant experience, why this company, availability, etc."
            rows={3}
            className="resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm"
          />
        </div>

        <button
          type="button"
          onClick={handleSubmit}
          disabled={!form.jobTitle || !form.companyName || submitting}
          className="rounded-lg bg-primary px-4 py-2 text-sm text-primary-foreground disabled:opacity-50"
        >
          {submitting ? "Starting…" : "Generate cover letter"}
        </button>
      </div>
    </main>
  )
}
