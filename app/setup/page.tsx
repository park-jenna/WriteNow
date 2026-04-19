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
      <div className="flex w-full max-w-md flex-col gap-4 rounded-xl border border-border bg-card p-10 shadow-sm">
        <h1 className="text-xl font-semibold">Set up your resume</h1>
        <p className="text-sm text-muted-foreground">
          Paste the Google Drive link to your resume. This is saved once and used for every
          generation.
        </p>
        <input
          type="text"
          placeholder="https://drive.google.com/file/d/..."
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
        />
        {error && <p className="text-sm text-red-500">{error}</p>}
        <button
          type="button"
          onClick={handleSubmit}
          disabled={loading || !url}
          className="rounded-lg bg-primary px-4 py-2 text-sm text-primary-foreground disabled:opacity-50"
        >
          {loading ? "Saving..." : "Save and continue"}
        </button>
      </div>
    </main>
  )
}
