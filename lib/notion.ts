function formatUuid32(hex32: string): string {
  const h = hex32.toLowerCase()
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20, 32)}`
}

/**
 * Notion expects `database_id` as a UUID only.
 * Accepts: plain UUID, 32 hex without hyphens, or a pasted notion.so/... URL.
 */
function normalizeNotionDatabaseId(raw: string): string {
  const s = raw.trim().replace(/^["']|["']$/g, "").replace(/\s/g, "")

  const pathBeforeQuery = s.split("?")[0]
  const contiguous32 = pathBeforeQuery.match(/([0-9a-f]{32})/i)
  if (contiguous32) {
    return formatUuid32(contiguous32[1])
  }

  const hexOnly = s.replace(/[^0-9a-f]/gi, "")
  if (hexOnly.length === 32) {
    return formatUuid32(hexOnly)
  }

  const uuidLike = s.match(
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  )
  if (uuidLike) {
    return uuidLike[0].toLowerCase()
  }

  return s
}

function notionProperties(
  userEmail: string,
  jobTitle: string,
  companyName: string,
  driveUrl: string | null
): Record<string, unknown> {
  const base: Record<string, unknown> = {
    "Job Title": {
      title: [{ text: { content: jobTitle } }],
    },
    Company: {
      rich_text: [{ text: { content: companyName } }],
    },
    Email: {
      email: userEmail,
    },
    Date: {
      date: { start: new Date().toISOString().split("T")[0] },
    },
    Status: {
      select: { name: "Generated" },
    },
  }
  if (driveUrl) {
    base["Drive Link"] = { url: driveUrl }
  }
  return base
}

export async function logToNotion({
  userEmail,
  jobTitle,
  companyName,
  driveUrl,
}: {
  userEmail: string
  jobTitle: string
  companyName: string
  driveUrl: string | null
}): Promise<string> {
  const token = process.env.NOTION_MCP_TOKEN
  const databaseIdRaw = process.env.NOTION_DATABASE_ID
  if (!token || !databaseIdRaw) {
    throw new Error("Notion is not configured")
  }

  const databaseId = normalizeNotionDatabaseId(databaseIdRaw)

  const res = await fetch("https://api.notion.com/v1/pages", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      "Notion-Version": "2022-06-28",
    },
    body: JSON.stringify({
      parent: { database_id: databaseId },
      properties: notionProperties(userEmail, jobTitle, companyName, driveUrl),
    }),
  })

  if (!res.ok) {
    const errText = await res.text()
    throw new Error(`Notion log failed: ${res.status} ${errText}`)
  }

  const data = (await res.json()) as { id: string }
  return `https://notion.so/${data.id.replace(/-/g, "")}`
}
