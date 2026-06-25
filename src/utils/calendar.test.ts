import { describe, it, expect } from 'vitest'
import { getMonthGrid, formatDate, formatDisplayDate } from './calendar'

describe('formatDate', () => {
  it('returns YYYY-MM-DD string using local time', () => {
    const date = new Date(2026, 5, 25) // June 25, 2026 (month is 0-indexed)
    expect(formatDate(date)).toBe('2026-06-25')
  })

  it('pads single-digit month and day', () => {
    const date = new Date(2026, 0, 5) // January 5, 2026
    expect(formatDate(date)).toBe('2026-01-05')
  })

  it('handles December correctly', () => {
    const date = new Date(2026, 11, 31) // December 31, 2026
    expect(formatDate(date)).toBe('2026-12-31')
  })
})

describe('formatDisplayDate', () => {
  it('returns "Monday, June 25" format', () => {
    const result = formatDisplayDate('2026-06-25')
    expect(result).toBe('Thursday, June 25')
  })

  it('handles different dates', () => {
    const result = formatDisplayDate('2026-01-01')
    expect(result).toBe('Thursday, January 1')
  })
})

describe('getMonthGrid', () => {
  it('returns exactly 42 cells', () => {
    const grid = getMonthGrid(2026, 5) // June 2026
    expect(grid).toHaveLength(42)
  })

  it('returns CalendarDay objects with correct shape', () => {
    const grid = getMonthGrid(2026, 5)
    const day = grid.find(d => d.isCurrentMonth && d.day === 25)
    expect(day).toBeDefined()
    expect(day!.date).toBe('2026-06-25')
    expect(day!.day).toBe(25)
    expect(day!.isCurrentMonth).toBe(true)
    expect(typeof day!.isToday).toBe('boolean')
  })

  it('starts with Sunday', () => {
    const grid = getMonthGrid(2026, 5) // June 2026 starts on Monday
    // First cell should be Sunday (May 31)
    expect(grid[0].isCurrentMonth).toBe(false)
    expect(grid[0].day).toBe(31) // May 31
  })

  it('marks current month days correctly', () => {
    const grid = getMonthGrid(2026, 5) // June 2026
    const currentMonthDays = grid.filter(d => d.isCurrentMonth)
    expect(currentMonthDays).toHaveLength(30) // June has 30 days
  })

  it('fills padding from previous month', () => {
    const grid = getMonthGrid(2026, 5) // June 2026 starts on Monday
    // First 1 cell should be from May (Sunday)
    const prevMonthDays = grid.filter(d => !d.isCurrentMonth)
    expect(prevMonthDays.length).toBeGreaterThan(0)
  })

  it('fills padding from next month to reach 42 cells', () => {
    const grid = getMonthGrid(2026, 5) // June 2026
    const nextMonthDays = grid.filter(d => !d.isCurrentMonth)
    // Should have padding days from both months
    expect(nextMonthDays.length).toBeGreaterThan(0)
    // Total should be 42
    expect(grid.length).toBe(42)
  })

  it('marks isToday correctly', () => {
    const today = new Date()
    const grid = getMonthGrid(today.getFullYear(), today.getMonth())
    const todayCell = grid.find(d => d.isToday)
    expect(todayCell).toBeDefined()
    expect(todayCell!.date).toBe(formatDate(today))
  })

  it('uses local time (not UTC)', () => {
    // Test that dates are computed in local time
    const grid = getMonthGrid(2026, 0) // January 2026
    const jan1 = grid.find(d => d.isCurrentMonth && d.day === 1)
    expect(jan1!.date).toBe('2026-01-01')
  })
})
