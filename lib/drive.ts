async function readGoogleErrorBody(res: Response): Promise<string> {
  try {
    const text = await res.text()
    if (!text) return ""
    const trimmed = text.slice(0, 280)
    try {
      const j = JSON.parse(text) as { error?: { message?: string } }
      return j.error?.message ?? trimmed
    } catch {
      return trimmed
    }
  } catch {
    return ""
  }
}

export async function fetchResumeText(
  fileId: string,
  accessToken: string
): Promise<string> {
  const exportRes = await fetch(
    `https://www.googleapis.com/drive/v3/files/${fileId}/export?mimeType=text/plain`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  )

  if (exportRes.ok) {
    return exportRes.text()
  }

  const mediaRes = await fetch(
    `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  )

  if (!mediaRes.ok) {
    const exportHint = await readGoogleErrorBody(exportRes)
    const mediaHint = await readGoogleErrorBody(mediaRes)
    throw new Error(
      `Drive ${exportRes.status}/${mediaRes.status}: ${exportHint || mediaHint || mediaRes.statusText}`.trim()
    )
  }
  const buffer = Buffer.from(await mediaRes.arrayBuffer())
  // Dynamic import: pdf-parse reads ./test/data at import time, which breaks
  // Next.js builds when imported statically. Lazy-load only when a PDF is needed.
  let PDFParse: (typeof import("pdf-parse"))["PDFParse"]
  try {
    ;({ PDFParse } = await import("pdf-parse"))
  } catch (e) {
    throw new Error(
      `PDF library failed to load: ${e instanceof Error ? e.message : String(e)}`
    )
  }
  const parser = new PDFParse({ data: buffer })
  try {
    const { text } = await parser.getText()
    return text
  } finally {
    await parser.destroy()
  }
}

export async function saveCoverLetter(
  content: string,
  fileName: string,
  accessToken: string
): Promise<string> {
  const boundary = "coverletterboundary"
  const delimiter = `\r\n--${boundary}\r\n`
  const closeDelimiter = `\r\n--${boundary}--`

  const metadata = { name: fileName, mimeType: "text/plain" }

  const body =
    delimiter +
    "Content-Type: application/json; charset=UTF-8\r\n\r\n" +
    JSON.stringify(metadata) +
    delimiter +
    "Content-Type: text/plain; charset=UTF-8\r\n\r\n" +
    content +
    closeDelimiter

  const res = await fetch(
    "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,webViewLink",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": `multipart/related; boundary=${boundary}`,
      },
      body,
    }
  )

  if (!res.ok) {
    throw new Error(`Drive save failed: ${res.status} ${res.statusText}`)
  }

  const data = (await res.json()) as { webViewLink?: string; id?: string }
  if (data.webViewLink) return data.webViewLink
  if (data.id) return `https://drive.google.com/file/d/${data.id}/view`
  throw new Error("Drive save returned no link")
}

