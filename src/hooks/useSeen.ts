import { useEffect, useRef, useState } from 'react'

/**
 * true once the element has scrolled into view while `active` (the tab is open), and false
 * again when the tab closes. A long page uses it to start each illustration where the visitor
 * actually sees it, instead of all of them at once when the tab opens.
 */
export function useSeen<T extends Element>(active: boolean) {
  const ref = useRef<T>(null)
  const [seen, setSeen] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!active || !el) return
    if (typeof IntersectionObserver === 'undefined') {
      const t = window.setTimeout(() => setSeen(true))
      return () => {
        window.clearTimeout(t)
        setSeen(false)
      }
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setSeen(true)
          io.disconnect()
        }
      },
      { threshold: 0.3 },
    )
    io.observe(el)
    return () => {
      io.disconnect()
      setSeen(false)
    }
  }, [active])
  return [ref, active && seen] as const
}
