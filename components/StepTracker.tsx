"use client"

export type StepStatus = "pending" | "running" | "done" | "error"

export type Step = {
  label: string
  status: StepStatus
}

const statusConfig: Record<
  StepStatus,
  { symbol: string; color: string; pulse?: boolean }
> = {
  pending: { symbol: "○", color: "var(--text-muted)" },
  running: { symbol: "●", color: "var(--accent)", pulse: true },
  done: { symbol: "✓", color: "var(--success)" },
  error: { symbol: "✕", color: "var(--error)" },
}

export default function StepTracker({ steps }: { steps: Step[] }) {
  return (
    <div className="flex flex-col">
      {steps.map((step, i) => {
        const cfg = statusConfig[step.status]
        return (
          <div
            key={`${step.label}-${i}`}
            className="flex items-center gap-3 py-2.5 pl-3.5"
            style={{
              borderLeft:
                step.status === "running" ? "2px solid var(--accent)" : "2px solid transparent",
              marginLeft: "-14px",
              paddingLeft: "14px",
              transition: "border-color 0.3s",
              animation: "fadeUp 0.3s ease forwards",
              animationDelay: `${i * 80}ms`,
              opacity: 0,
            }}
          >
            <span
              className="inline-flex w-4 justify-center text-sm"
              style={{
                color: cfg.color,
                animation: cfg.pulse ? "pulse 1.2s ease-in-out infinite" : "none",
              }}
            >
              {cfg.symbol}
            </span>
            <span
              className="text-sm"
              style={{
                color: step.status === "pending" ? "var(--text-muted)" : "var(--text-primary)",
              }}
            >
              {step.label}
            </span>
          </div>
        )
      })}
    </div>
  )
}
