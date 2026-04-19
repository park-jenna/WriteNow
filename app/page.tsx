import { getServerSession } from "next-auth/next"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { getResumeFileId } from "@/lib/supabase"
import HomeForm from "@/components/HomeForm"

export const dynamic = "force-dynamic"

export default async function HomePage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    redirect("/login")
  }

  const resumeId = await getResumeFileId(session.user.email)
  if (!resumeId) {
    redirect("/setup")
  }

  return <HomeForm />
}
