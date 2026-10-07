import type { CSSProperties } from 'react'

export type Viewport = { w: number; h: number; mobile: boolean }

export type ViewMode = 'stack' | 'grid'

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v))

export const sidePad = (vp: Viewport) => (vp.mobile ? 16 : clamp(vp.w * 0.111, 24, 160))

type Slot = {
  /** position among visible (non-closed) tabs */
  v: number
  /** visible tab count */
  n: number
  /** visible index of the open tab, -1 when the stack is shown */
  openV: number
  /** stack index of the hovered tab, -1 when none */
  hoverV: number
  self: boolean
  gone: boolean
}

// Every transform starts with translateY(var(--iy)) so GSAP can drive the
// intro through a CSS variable without fighting React's inline transform.
// --fr is the tilt GSAP adds while cards fly between the stack and grid views.
const IY = 'translateY(var(--iy, 0px)) rotate(var(--fr, 0deg))'

/** Card geometry for the "night stack" layout and the side-by-side grid view. */
export function cardStyle(vp: Viewport, slot: Slot, mode: ViewMode = 'stack'): CSSProperties {
  const { v, n, openV, hoverV, self, gone } = slot
  if (self) {
    return {
      top: 0,
      left: 0,
      width: vp.w,
      height: vp.h,
      transform: IY,
      borderRadius: 0,
      zIndex: 100,
      overflowY: 'auto',
      cursor: 'default',
      boxShadow: 'none',
    }
  }

  if (mode === 'grid') return gridStyle(vp, slot)

  const pad = sidePad(vp)
  // Short screens (landscape phones, small laptops) get a compact header, so the stack starts higher.
  const short = vp.h < 620
  const top0 = short ? 112 : vp.mobile ? 214 : 190
  const lastTop = vp.h - (short ? 170 : vp.mobile ? 200 : 300)
  const step = n > 1 ? clamp((lastTop - top0) / (n - 1), short ? 22 : 40, vp.mobile ? 100 : 96) : 0
  const shrink = vp.mobile ? 0.03 : 0.025
  // Hover peek: the hovered tab lifts, tabs in front of it slide down.
  const peek = hoverV === -1 ? 0 : v === hoverV ? -12 : v > hoverV ? (vp.mobile ? 24 : 44) : 0

  const s: CSSProperties = {
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

/** Top of the card area: below the header, compact on short screens. */
const areaTop = (vp: Viewport) => (vp.h < 620 ? 112 : vp.mobile ? 214 : 190)

/** Grid view: tabs side by side in reading order (About first), sized to fit the screen. */
function gridStyle(vp: Viewport, { v, n, openV, hoverV, gone }: Slot): CSSProperties {
  const r = n - 1 - v // reading position
  const cols = vp.w >= 1100 ? 4 : vp.w >= 700 ? 3 : 2
  const rows = Math.ceil(n / cols)
  const gap = vp.mobile ? 10 : 18
  const pad = vp.mobile ? 16 : clamp(vp.w * 0.03, 16, 48)
  const top0 = areaTop(vp)
  const availH = vp.h - top0 - (vp.mobile ? 20 : 36)
  const cw = (vp.w - pad * 2 - gap * (cols - 1)) / cols
  const ch = Math.max(90, Math.min((availH - gap * (rows - 1)) / rows, cw * 1.15))
  const row = Math.floor(r / cols)
  const col = r % cols
  // centre an incomplete last row
  const inRow = row === rows - 1 ? n - row * cols : cols
  const offset = ((cols - inRow) * (cw + gap)) / 2

  const s: CSSProperties = {
    zIndex: 10 + r,
    top: top0 + row * (ch + gap),
    left: pad + offset + col * (cw + gap),
    width: cw,
    height: ch,
    borderRadius: 14,
    transform: `${IY} translateY(${v === hoverV ? -8 : 0}px)`,
    boxShadow: v === hoverV ? '0 26px 50px rgba(0,0,0,.6)' : '0 16px 36px rgba(0,0,0,.5)',
  }
  if (gone) return { ...s, transform: `${IY} translateX(${-(vp.w + 60)}px) rotate(-8deg)`, opacity: 0, pointerEvents: 'none' }
  if (openV > -1) return { ...s, transform: `${IY} scale(.94)`, opacity: 0, pointerEvents: 'none' }
  return s
}
