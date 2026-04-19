"use client"

import { signIn } from "next-auth/react"

export default function LoginPage() {
  return (
    <main className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center px-4 py-10">
      <div className="flex w-full max-w-sm flex-col items-center gap-6 rounded-xl border border-border bg-card p-10 shadow-sm">
        <h1 className="text-2xl font-semibold">Cover Letter Gen</h1>
        <p className="text-center text-sm text-muted-foreground">
          Generate tailored cover letters using your resume and AI research.
        </p>
        <button
          type="button"
          onClick={() => signIn("google", { callbackUrl: "/" })}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-border px-4 py-2 text-sm transition-colors hover:bg-accent"
        >
          Sign in with Google
        </button>
      </div>
    </main>
  )
}
