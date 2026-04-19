"use client"

import { usePathname } from "next/navigation"
import Header from "@/components/Header"

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const showHeader = pathname !== "/login"

  return (
    <>
      {showHeader && <Header />}
      <div className={showHeader ? "pt-14" : ""}>{children}</div>
    </>
  )
}
