import { getServerSession } from "next-auth/next"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { getResumeFileId } from "@/lib/supabase"

export const dynamic = "force-dynamic"

export default async function GenerateLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    redirect("/login")
  }

  const fileId = await getResumeFileId(session.user.email)
  if (!fileId) {
    redirect("/setup")
  }

  return <>{children}</>
}
