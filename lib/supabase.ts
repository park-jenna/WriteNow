import { createClient, type SupabaseClient } from "@supabase/supabase-js"

function getClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY")
  }
  return createClient(url, key)
}

export async function upsertUserOnLogin(email: string) {
  await getClient().from("users").upsert(
    { email },
    { onConflict: "email", ignoreDuplicates: true }
  )
}

export async function getResumeFileId(email: string): Promise<string | null> {
  const { data, error } = await getClient()
    .from("users")
    .select("resume_file_id")
    .eq("email", email)
    .single()

  if (error || !data) return null
  return data.resume_file_id ?? null
}

export async function saveResumeFileId(email: string, fileId: string): Promise<void> {
  const { error } = await getClient().from("users").upsert(
    { email, resume_file_id: fileId },
    { onConflict: "email" }
  )

  if (error) throw error
}
