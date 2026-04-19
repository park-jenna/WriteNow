"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

export default function SetupPage() {
  const [url, setUrl] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  function extractFileId(value: string): string | null {
    const match = value.match(/\/d\/([a-zA-Z0-9_-]+)/)
    return match ? match[1] : null
  }

  async function handleSubmit() {
    const fileId = extractFileId(url)
    if (!fileId) {
      setError(
        "Could not find a file ID in that URL. Make sure it is a Google Drive share link."
      )
      return
    }
    setError("")
    setLoading(true)
    const res = await fetch("/api/setup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fileId }),
    })
    if (res.ok) {
      router.push("/")
      router.refresh()
    } else {
      let message = "Something went wrong. Please try again."
      try {
        const data = (await res.json()) as { error?: string; detail?: string }
        if (data.detail) {
          message = `${data.error ?? message} (${data.detail})`
        } else if (data.error) {
          message = data.error
        }
      } catch {
        /* keep default */
      }
      setError(message)
      setLoading(false)
    }
  }

  return (
    <main className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center px-4 py-10">
      <div className="glass-card w-full max-w-[460px] p-10">
        <p
          className="mb-3 text-[0.7rem] uppercase tracking-[0.08em]"
          style={{ color: "var(--text-muted)" }}
        >
          One-time setup
        </p>
        <h1 className="mb-2.5 text-xl font-semibold">Connect your resume</h1>
        <p className="mb-7 text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
          Paste your Google Drive file link. Your resume is fetched fresh every time you generate a
          letter.
        </p>

        <label className="field-label">Google Drive URL</label>
        <input
          type="text"
          placeholder="https://drive.google.com/file/d/..."
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="glass-input font-mono text-xs"
        />
        {error && (
          <p className="mt-2 text-sm" style={{ color: "var(--error)" }}>
            {error}
          </p>
        )}
        <button
          type="button"
          className="btn-primary mt-5"
          onClick={handleSubmit}
          disabled={loading || !url}
        >
          {loading ? "Saving…" : "Save and continue"}
        </button>
      </div>
    </main>
  )
}
