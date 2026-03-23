// streak tracking for daily reality checks
// nothing fancy, just localStorage with date logic

const KEY = "unfilter-streak"

type StreakData = { count: number; lastDate: string }

function todayISO() {
  return new Date().toISOString().slice(0, 10)
}

export function getStreak(): StreakData {
  if (typeof window === "undefined") return { count: 0, lastDate: "" }
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return { count: 0, lastDate: "" }
    return JSON.parse(raw) as StreakData
  } catch {
    return { count: 0, lastDate: "" }
  }
}

// marks today as complete, returns new streak count
export function markStreakToday(): number {
  const today = todayISO()
  const s = getStreak()

  if (s.lastDate === today) return s.count

  // check if previous calendar day (still continuing streak)
  const yday = new Date()
  yday.setDate(yday.getDate() - 1)
  const yesterdayStr = yday.toISOString().slice(0, 10)

  const newCount = s.lastDate === yesterdayStr ? s.count + 1 : 1
  localStorage.setItem(KEY, JSON.stringify({ count: newCount, lastDate: today }))
  return newCount
}

export function isDoneToday(): boolean {
  return getStreak().lastDate === todayISO()
}
