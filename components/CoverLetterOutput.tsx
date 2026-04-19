import Link from "next/link"

export default function CoverLetterOutput({
  coverLetter,
  driveUrl,
  notionUrl,
  warnings,
}: {
  coverLetter: string
  driveUrl: string | null
  notionUrl: string | null
  warnings: string[]
}) {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-semibold">Your cover letter is ready</h1>

      {warnings.length > 0 && (
        <div className="rounded-lg border border-yellow-200 bg-yellow-50 px-4 py-3 text-sm text-yellow-800 dark:border-yellow-900/60 dark:bg-yellow-950/40 dark:text-yellow-200">
          {warnings.map((w, i) => (
            <p key={i}>{w}</p>
          ))}
        </div>
      )}

      <div className="rounded-xl border border-border bg-card p-6 font-serif text-sm leading-relaxed whitespace-pre-wrap text-card-foreground">
        {coverLetter}
      </div>

      <div className="flex flex-wrap gap-3">
        {driveUrl && (
          <a
            href={driveUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg border border-border px-4 py-2 text-sm transition-colors hover:bg-accent"
          >
            Open in Drive
          </a>
        )}
        {notionUrl && (
          <a
            href={notionUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg border border-border px-4 py-2 text-sm transition-colors hover:bg-accent"
          >
            View in Notion
          </a>
        )}
        <Link
          href="/"
          className="rounded-lg border border-border px-4 py-2 text-sm transition-colors hover:bg-accent"
        >
          Generate another
        </Link>
      </div>
    </div>
  )
}
