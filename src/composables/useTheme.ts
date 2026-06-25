import { ref, watch } from 'vue'

type Theme = 'light' | 'dark' | 'system'

const theme = ref<Theme>(
  (localStorage.getItem('theme') as Theme) || 'system'
)

function applyTheme(t: Theme) {
  const html = document.documentElement

  if (t === 'dark') {
    html.classList.add('dark')
  } else if (t === 'light') {
    html.classList.remove('dark')
  } else {
    html.classList.toggle(
      'dark',
      window.matchMedia('(prefers-color-scheme: dark)').matches
    )
  }
}

export function useTheme() {
  applyTheme(theme.value)

  watch(theme, (newTheme) => {
    localStorage.setItem('theme', newTheme)
    applyTheme(newTheme)
  })

  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    if (theme.value === 'system') {
      applyTheme('system')
    }
  })

  function toggleTheme() {
    theme.value = theme.value === 'dark' ? 'light' : 'dark'
  }

  return { theme, toggleTheme }
}
