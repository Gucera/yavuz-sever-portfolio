import { useEffect, useRef } from 'react'
import type { BadgeTheme } from './uelScene'

/** 3D University of East London crest. three.js is loaded lazily. */
export function UelBadge({ bg, face, side, rim }: BadgeTheme) {
  const hostRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const host = hostRef.current
    if (!host) return
    let disposed = false
    let cleanup: (() => void) | undefined
    import('./uelScene')
      .then(({ mountUelBadge }) => mountUelBadge(host, { bg, face, side, rim }))
      .then((fn) => {
        if (disposed) fn()
        else cleanup = fn
      })
      .catch((err) => console.error('UEL badge failed to load', err))
    return () => {
      disposed = true
      cleanup?.()
    }
  }, [bg, face, side, rim])

  return <div ref={hostRef} className="uel-badge" role="img" aria-label="University of East London crest" />
}
