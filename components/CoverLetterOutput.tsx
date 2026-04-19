import Link from "next/link"

export default function CoverLetterOutput({
  jobTitle,
  companyName,
  coverLetter,
  driveUrl,
  notionUrl,
  warnings,
}: {
  jobTitle: string
  companyName: string
  coverLetter: string
  driveUrl: string | null
  notionUrl: string | null
  warnings: string[]
}) {
  return (
    <div className="w-full max-w-[680px] px-6 py-6">
      <div className="mb-5 flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div>
          <p
            className="mb-1 text-[0.7rem] uppercase tracking-[0.08em]"
            style={{ color: "var(--text-muted)" }}
          >
            Cover Letter
          </p>
          <h1 className="text-xl font-semibold tracking-tight" style={{ letterSpacing: "-0.02em" }}>
            {jobTitle} at {companyName}
          </h1>
        </div>
        <div className="flex flex-wrap gap-2">
          {driveUrl && (
            <a href={driveUrl} target="_blank" rel="noopener noreferrer" className="btn-ghost">
              Open in Drive
            </a>
          )}
          <Link href="/" className="btn-ghost">
            Generate another
          </Link>
        </div>
      </div>

      {warnings.length > 0 && (
        <div
          className="glass-card mb-5 border px-4 py-3 text-sm"
          style={{ borderColor: "rgba(251, 191, 36, 0.35)", color: "var(--warning)" }}
        >
          {warnings.map((w, i) => (
            <p key={i}>{w}</p>
          ))}
        </div>
      )}

      <div
        className="glass-card-strong letter-body whitespace-pre-wrap text-[0.9rem] leading-[1.85]"
        style={{ color: "var(--text-primary)" }}
      >
        {coverLetter}
      </div>

      {notionUrl && (
        <div className="mt-3.5 flex justify-end">
          <p className="text-[0.72rem]" style={{ color: "var(--text-muted)" }}>
            ✓ Logged to Notion &nbsp;·&nbsp;
            <span className="text-xs">Per-user Notion workspaces coming soon</span>
          </p>
        </div>
      )}
    </div>
  )
}
