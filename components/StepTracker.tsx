"use client"

import { motion, AnimatePresence } from "framer-motion"

export type StepStatus = "pending" | "running" | "done" | "error"

export type Step = {
  label: string
  status: StepStatus
}

const icons: Record<StepStatus, string> = {
  pending: "○",
  running: "⟳",
  done: "✓",
  error: "✕",
}

const colors: Record<StepStatus, string> = {
  pending: "text-muted-foreground",
  running: "text-blue-500",
  done: "text-green-600",
  error: "text-red-500",
}

export default function StepTracker({ steps }: { steps: Step[] }) {
  return (
    <div className="flex flex-col gap-3">
      {steps.map((step, i) => (
        <motion.div
          key={`${step.label}-${i}`}
          initial={{ opacity: 0, x: -6 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.04 }}
          className="flex items-center gap-3 text-sm"
        >
          <span
            className={`inline-flex w-5 justify-center font-mono ${colors[step.status]} ${
              step.status === "running" ? "animate-spin" : ""
            }`}
          >
            <AnimatePresence mode="wait">
              <motion.span
                key={step.status}
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.85 }}
                transition={{ duration: 0.15 }}
              >
                {icons[step.status]}
              </motion.span>
            </AnimatePresence>
          </span>
          <span
            className={
              step.status === "pending" ? "text-muted-foreground" : "text-foreground"
            }
          >
            {step.label}
          </span>
        </motion.div>
      ))}
    </div>
  )
}
