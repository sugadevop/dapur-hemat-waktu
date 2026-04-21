import { ref, watch, onMounted } from 'vue'

const isDark = ref(false)

export function useDarkMode() {
  function toggle() {
    isDark.value = !isDark.value
    apply()
    localStorage.setItem('darkMode', isDark.value ? 'true' : 'false')
  }

  function apply() {
    if (isDark.value) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }

  onMounted(() => {
    const saved = localStorage.getItem('darkMode')
    if (saved === 'true') {
      isDark.value = true
    } else if (saved === null) {
      // Follow system preference
      isDark.value = window.matchMedia('(prefers-color-scheme: dark)').matches
    }
    apply()
  })

  return { isDark, toggle }
}
