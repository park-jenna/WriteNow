"use client"

import Link from "next/link"
import { signOut, useSession } from "next-auth/react"

export default function Header() {
  const { data: session } = useSession()

  return (
    <header className="flex items-center justify-between border-b border-border px-4 py-3">
      <Link href="/" className="text-sm font-semibold tracking-tight">
        Cover Letter Gen
      </Link>
      <div className="flex items-center gap-4">
        <Link
          href="/setup"
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          Update resume
        </Link>
        {session?.user && (
          <div className="flex items-center gap-2">
            {session.user.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={session.user.image}
                alt=""
                width={32}
                height={32}
                className="h-8 w-8 rounded-full object-cover"
              />
            ) : (
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-xs font-medium">
                {(session.user.name || session.user.email || "?").slice(0, 1).toUpperCase()}
              </span>
            )}
            <button
              type="button"
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Sign out
            </button>
          </div>
        )}
      </div>
    </header>
  )
}
