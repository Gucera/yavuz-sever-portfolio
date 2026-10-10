import { useEffect, useRef } from 'react'
import type { BadgeTheme } from './uelScene'

/**
 * 3D University of East London crest. Until the Education tab is opened it's a flat picture
 * of the crest, so three.js is only downloaded and started for visitors who open the tab.
 */
export function UelBadge({ bg, face, side, rim, live }: BadgeTheme & { live: boolean }) {
  const hostRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const host = hostRef.current
    if (!host || !live) return
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
  }, [bg, face, side, rim, live])

  if (!live) return <div className="uel-badge uel-badge--flat" role="img" aria-label="University of East London crest" style={{ color: face }} />
  return <div ref={hostRef} className="uel-badge" role="img" aria-label="University of East London crest" />
}
