"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

export default function HomeForm({ inputError }: { inputError?: string }) {
  const [form, setForm] = useState({
    jobTitle: "",
    companyName: "",
    jobDescription: "",
    personalNote: "",
  })
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  function handleSubmit() {
    if (!form.jobTitle || !form.companyName) return
    setLoading(true)
    sessionStorage.setItem("generateInput", JSON.stringify(form))
    router.push("/generate")
  }

  return (
    <main className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center px-4 py-10">
      <div className="w-full max-w-[560px] px-6 py-10">
        <h1 className="mb-1.5 text-2xl font-semibold tracking-tight" style={{ letterSpacing: "-0.02em" }}>
          New application
        </h1>
        <p className="mb-8 text-sm" style={{ color: "var(--text-secondary)" }}>
          Fill in the details and WriteNow handles the rest.
        </p>

        {inputError && (
          <p
            className="glass-card mb-6 border px-4 py-3 text-sm"
            style={{ borderColor: "rgba(248, 113, 113, 0.35)", color: "var(--error)" }}
          >
            {inputError}
          </p>
        )}

        <div className="glass-card flex flex-col gap-5 p-7">
          <div className="form-grid">
            <div>
              <label className="field-label">Job Title *</label>
              <input
                value={form.jobTitle}
                onChange={(e) => setForm({ ...form, jobTitle: e.target.value })}
                placeholder="Software Engineer"
                className="glass-input"
              />
            </div>
            <div>
              <label className="field-label">Company *</label>
              <input
                value={form.companyName}
                onChange={(e) => setForm({ ...form, companyName: e.target.value })}
                placeholder="Anthropic"
                className="glass-input"
              />
            </div>
          </div>

          <div>
            <label className="field-label">
              Job Description
              <span
                className="ml-1.5 font-normal normal-case tracking-normal"
                style={{ color: "var(--text-muted)" }}
              >
                optional
              </span>
            </label>
            <textarea
              value={form.jobDescription}
              onChange={(e) => setForm({ ...form, jobDescription: e.target.value })}
              placeholder="Paste the full JD here…"
              rows={5}
              className="glass-input resize-none"
            />
          </div>

          <div>
            <label className="field-label">
              Personal Note
              <span
                className="ml-1.5 font-normal normal-case tracking-normal"
                style={{ color: "var(--text-muted)" }}
              >
                optional
              </span>
            </label>
            <textarea
              value={form.personalNote}
              onChange={(e) => setForm({ ...form, personalNote: e.target.value })}
              placeholder="Relevant experience, why this company, availability…"
              rows={3}
              className="glass-input resize-none"
            />
          </div>

          <button
            type="button"
            className="btn-primary"
            onClick={handleSubmit}
            disabled={!form.jobTitle || !form.companyName || loading}
          >
            {loading ? "Generating…" : "Generate Cover Letter"}
          </button>
        </div>
      </div>
    </main>
  )
}
