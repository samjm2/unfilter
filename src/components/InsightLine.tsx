"use client"

import { useEffect, useState } from "react"

// fades in after a delay, then fades out
// used after lab runs, check-ins, etc. — one line, no fanfare
interface InsightLineProps {
  text: string
  delay?: number
}

export function InsightLine({ text, delay = 1200 }: InsightLineProps) {
  const [show, setShow] = useState(false)
  const [fading, setFading] = useState(false)

  useEffect(() => {
    const t1 = setTimeout(() => setShow(true), delay)
    const t2 = setTimeout(() => setFading(true), delay + 5500)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [delay])

  if (!show) return null

  return (
    <p
      className={`text-[12px] italic text-[var(--text-muted)] mt-3 transition-opacity duration-700 ${
        fading ? "opacity-0" : "opacity-100"
      }`}
    >
      {text}
    </p>
  )
}
