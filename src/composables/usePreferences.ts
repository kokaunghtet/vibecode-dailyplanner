import { ref, watch } from 'vue'

export type WeekStart = 'sun' | 'mon'
export type LandingView = 'today' | 'calendar'
export type DateFormat = 'en-US' | 'en-GB'

const weekStart = ref<WeekStart>(
  (localStorage.getItem('pref_weekStart') as WeekStart) || 'sun'
)
const landingView = ref<LandingView>(
  (localStorage.getItem('pref_landingView') as LandingView) || 'today'
)
const dateFormat = ref<DateFormat>(
  (localStorage.getItem('pref_dateFormat') as DateFormat) || 'en-US'
)

watch(weekStart, (v) => localStorage.setItem('pref_weekStart', v))
watch(landingView, (v) => localStorage.setItem('pref_landingView', v))
watch(dateFormat, (v) => localStorage.setItem('pref_dateFormat', v))

export function usePreferences() {
  return { weekStart, landingView, dateFormat }
}
