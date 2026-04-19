"use client"

import { signIn } from "next-auth/react"

export default function LoginForm() {
  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="glass-card-strong w-full max-w-[380px] px-9 py-10">
        <div
          className="mb-6 flex h-10 w-10 items-center justify-center rounded-[10px] text-lg font-semibold text-white"
          style={{
            background: "linear-gradient(135deg, #6366f1, #a78bfa)",
            boxShadow: "0 4px 16px rgba(99, 102, 241, 0.4)",
          }}
        >
          W
        </div>

        <h1 className="mb-2 text-2xl font-semibold">WriteNow</h1>
        <p className="mb-8 text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
          Generate tailored cover letters in seconds.
        </p>

        <button type="button" className="btn-primary" onClick={() => signIn("google", { callbackUrl: "/" })}>
          Continue with Google
        </button>
      </div>
    </main>
  )
}
