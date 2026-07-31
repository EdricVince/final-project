import { describe, it, expect, beforeEach } from 'vitest'
import { useTheme } from './useTheme'

describe('useTheme', () => {
  beforeEach(() => {
    localStorage.clear()
    document.documentElement.classList.remove('dark')
  })

  it('setTheme("dark") adds the dark class, sets isDark and persists', () => {
    const { setTheme, isDark } = useTheme()
    setTheme('dark')
    expect(document.documentElement.classList.contains('dark')).toBe(true)
    expect(isDark.value).toBe(true)
    expect(localStorage.getItem('studyspark-theme')).toBe('dark')
  })

  it('setTheme("light") removes the dark class', () => {
    const { setTheme } = useTheme()
    setTheme('dark')
    setTheme('light')
    expect(document.documentElement.classList.contains('dark')).toBe(false)
    expect(localStorage.getItem('studyspark-theme')).toBe('light')
  })

  it('toggleTheme flips between light and dark', () => {
    const { setTheme, toggleTheme, isDark } = useTheme()
    setTheme('light')
    toggleTheme()
    expect(isDark.value).toBe(true)
    toggleTheme()
    expect(isDark.value).toBe(false)
  })
})
