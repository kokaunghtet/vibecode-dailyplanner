export interface CalendarDay {
  date: string
  day: number
  isCurrentMonth: boolean
  isToday: boolean
}

export function formatDate(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function formatDisplayDate(dateStr: string, locale = 'en-US'): string {
  const date = new Date(dateStr + 'T00:00:00')
  return date.toLocaleDateString(locale, { weekday: 'long', month: 'long', day: 'numeric' })
}

export function getMonthGrid(year: number, month: number, weekStart: 'sun' | 'mon' = 'sun'): CalendarDay[] {
  const weekStartIndex = weekStart === 'mon' ? 1 : 0
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const startDayOfWeek = (firstDay.getDay() - weekStartIndex + 7) % 7 // days to pad before month start
  const daysInMonth = lastDay.getDate()

  const today = new Date()
  const todayStr = formatDate(today)

  const grid: CalendarDay[] = []

  // Padding days from previous month
  const prevMonthLastDay = new Date(year, month, 0).getDate()
  for (let i = startDayOfWeek - 1; i >= 0; i--) {
    const day = prevMonthLastDay - i
    const date = new Date(year, month - 1, day)
    grid.push({ date: formatDate(date), day, isCurrentMonth: false, isToday: false })
  }

  // Current month days
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day)
    grid.push({
      date: formatDate(date),
      day,
      isCurrentMonth: true,
      isToday: formatDate(date) === todayStr,
    })
  }

  // Padding days from next month (fill to 42 cells = 6 rows)
  const remaining = 42 - grid.length
  for (let day = 1; day <= remaining; day++) {
    const date = new Date(year, month + 1, day)
    grid.push({ date: formatDate(date), day, isCurrentMonth: false, isToday: false })
  }

  return grid
}
