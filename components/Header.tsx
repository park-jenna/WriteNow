"use client"

import Link from "next/link"
import { signOut, useSession } from "next-auth/react"

export default function Header() {
  const { data: session } = useSession()
  const email = session?.user?.email

  return (
    <header
      className="fixed left-0 right-0 top-0 z-50 flex h-14 items-center justify-between border-b px-6"
      style={{
        background: "rgba(5, 5, 15, 0.7)",
        borderColor: "var(--glass-border)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
      }}
    >
      <Link
        href="/"
        className="text-base font-semibold tracking-tight"
        style={{ letterSpacing: "-0.02em" }}
      >
        WriteNow
      </Link>
      <div className="flex items-center gap-4">
        <Link
          href="/setup"
          className="text-xs transition-colors hover:opacity-90"
          style={{ color: "var(--text-secondary)" }}
        >
          Update resume
        </Link>
        {session?.user && (
          <div className="flex items-center gap-3">
            {email && (
              <span className="hidden max-w-[140px] truncate text-xs sm:inline" style={{ color: "var(--text-muted)" }}>
                {email}
              </span>
            )}
            {session.user.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={session.user.image}
                alt=""
                width={32}
                height={32}
                className="h-8 w-8 rounded-full object-cover ring-1 ring-white/10"
              />
            ) : (
              <span
                className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-medium"
                style={{ background: "var(--glass-bg)", color: "var(--text-secondary)" }}
              >
                {(session.user.name || session.user.email || "?").slice(0, 1).toUpperCase()}
              </span>
            )}
            <button
              type="button"
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="text-xs transition-opacity hover:opacity-90"
              style={{ color: "var(--text-secondary)" }}
            >
              Sign out
            </button>
          </div>
        )}
      </div>
    </header>
  )
}
