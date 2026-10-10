import { useCallback, useEffect, useState } from 'react'
import { readStr, writeStr } from '../app/util'

export type Theme = 'auto' | 'day' | 'night'

/** Day between 7:00 and 19:00 local time, when the theme is on auto. */
const resolve = (t: Theme) => (t !== 'auto' ? t : new Date().getHours() >= 7 && new Date().getHours() < 19 ? 'day' : 'night')
const read = (): Theme => {
  const t = readStr('theme')
  return t === 'day' || t === 'night' ? t : 'auto'
}

/** Colour theme: day or night, or auto (follows the clock, checked every few minutes). */
export function useTheme() {
  const [theme, setThemeState] = useState<Theme>(read)
  const [themeNow, setThemeNow] = useState(() => resolve(read()))
  const setTheme = useCallback((t: Theme) => {
    setThemeState(t)
    setThemeNow(resolve(t))
    writeStr('theme', t === 'auto' ? null : t)
  }, [])
  useEffect(() => {
    document.documentElement.dataset.theme = themeNow
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', themeNow === 'day' ? '#efeae0' : '#0c0c0d')
  }, [themeNow])
  useEffect(() => {
    if (theme !== 'auto') return
    const t = window.setInterval(() => setThemeNow(resolve('auto')), 5 * 60 * 1000)
    return () => window.clearInterval(t)
  }, [theme])
  return { theme, themeNow, setTheme }
}
