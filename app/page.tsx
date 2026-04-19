import { getServerSession } from "next-auth/next"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { getResumeFileId } from "@/lib/supabase"
import HomeForm from "@/components/HomeForm"

export const dynamic = "force-dynamic"

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    redirect("/login")
  }

  const resumeId = await getResumeFileId(session.user.email)
  if (!resumeId) {
    redirect("/setup")
  }

  const params = await searchParams
  const inputError =
    params.error === "no-input"
      ? "No application details found. Fill out the form and try again."
      : undefined

  return <HomeForm inputError={inputError} />
}
