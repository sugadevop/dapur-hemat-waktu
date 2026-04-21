import { ref, watchEffect } from 'vue'

// Module-level state (shared across all components)
const isDark = ref(false)
let initialized = false

function apply() {
  if (isDark.value) {
    document.documentElement.classList.add('dark')
    document.documentElement.style.colorScheme = 'dark'
  } else {
    document.documentElement.classList.remove('dark')
    document.documentElement.style.colorScheme = 'light'
  }
}

function init() {
  if (initialized) return
  initialized = true

  const saved = localStorage.getItem('darkMode')
  if (saved === 'true') {
    isDark.value = true
  } else if (saved === 'false') {
    isDark.value = false
  } else {
    // No preference saved — follow system
    isDark.value = window.matchMedia('(prefers-color-scheme: dark)').matches
  }
  apply()

  // Listen for system theme changes
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    // Only follow system if user hasn't manually set preference
    if (localStorage.getItem('darkMode') === null) {
      isDark.value = e.matches
      apply()
    }
  })
}

export function useDarkMode() {
  init()

  function toggle() {
    isDark.value = !isDark.value
    apply()
    localStorage.setItem('darkMode', isDark.value ? 'true' : 'false')
  }

  return { isDark, toggle }
}
