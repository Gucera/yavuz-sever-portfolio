import type { CSSProperties } from 'react'
import { IY, areaTop, clamp, pageVars, pageWidth, sidePad, type Slot, type Viewport } from './common'

/** Stack view: the "night stack" — tabs piled like browser tabs, About me at the front. */
export function stackStyle(vp: Viewport, { v, n, openV, hoverV, gone }: Slot): CSSProperties {
  const pad = sidePad(vp)
  // Short screens (landscape phones, small laptops) get a compact header, so the stack starts higher.
  const short = vp.h < 620
  const top0 = areaTop(vp)
  const lastTop = vp.h - (short ? 170 : vp.mobile ? 200 : 300)
  const step = n > 1 ? clamp((lastTop - top0) / (n - 1), short ? 22 : 40, vp.mobile ? 100 : 96) : 0
  const shrink = vp.mobile ? 0.03 : 0.025
  // Hover peek: the hovered tab lifts, tabs in front of it slide down.
  const peek = hoverV === -1 ? 0 : v === hoverV ? -12 : v > hoverV ? (vp.mobile ? 24 : 44) : 0

  const s: CSSProperties = {
    ...pageVars(pageWidth(vp), 1),
    zIndex: v + 1,
    top: top0 + v * step,
    left: pad,
    width: vp.w - pad * 2,
    height: vp.mobile ? clamp(vp.h * 0.69, 420, 560) : clamp(vp.h * 0.71, 480, 640),
    borderRadius: vp.mobile ? 16 : 18,
    transform: `${IY} translateY(${peek}px) scale(${1 - (n - 1 - v) * shrink})`,
    boxShadow: vp.mobile ? '0 -12px 30px rgba(0,0,0,.65)' : '0 -14px 40px rgba(0,0,0,.7)',
  }

  if (gone) {
    return { ...s, transform: `${IY} translateX(${-(vp.w + 60)}px) rotate(-8deg)`, opacity: 0, pointerEvents: 'none' }
  }
  if (openV > -1) {
    if (v < openV) return { ...s, transform: `${IY} scale(.92) translateY(-20px)`, opacity: 0, pointerEvents: 'none' }
    return { ...s, top: vp.h + 100 }
  }
  return s
}
