import type { CSSProperties } from 'react'
import { IY, areaTop, clamp, gridBarHeight, pageBarHeight, pageVars, pageWidth, type Slot, type Viewport } from './common'

/** Playing-card size for the cards view (portrait, 5:7). */
const handCardSize = (vp: Viewport) => {
  const want = vp.mobile ? clamp(vp.h * 0.3, 170, 236) : clamp(vp.h * 0.5, 260, 440)
  // short windows (landscape phones): never let the hand reach up under the header
  const room = vp.h - (vp.mobile ? 26 : 40) - areaTop(vp) - 8
  const ch = Math.max(110, Math.min(want, room))
  return { cw: ch / 1.4, ch }
}

/**
 * Cards view: the tabs held as a fanned hand of playing cards at the bottom of the screen.
 * Every card's top-centre sits on a circle around a pivot below the hand and the card is
 * rotated about that point, so its axis runs through the pivot like a real fan.
 */
export function handCard(vp: Viewport, r: number, n: number) {
  const { cw, ch } = handCardSize(vp)
  const R = vp.mobile ? vp.w * 0.95 : clamp(vp.w * 0.75, 700, 1150)
  const reach = vp.w / 2 - cw / 2 - (vp.mobile ? 6 : 40)
  const spread = n > 1 ? Math.min(vp.mobile ? 40 : 56, (2 * Math.asin(clamp(reach / R, 0, 1)) * 180) / Math.PI) : 0
  const angle = n > 1 ? -spread / 2 + (r * spread) / (n - 1) : 0
  const a = (angle * Math.PI) / 180
  const topCentre = vp.h - ch - (vp.mobile ? 26 : 40) // where the middle card's top sits
  const px = vp.w / 2
  const py = topCentre + R
  return {
    top: py - R * Math.cos(a),
    left: px + R * Math.sin(a) - cw / 2,
    width: cw,
    height: ch,
    angle,
  }
}

/** How far a card on the table lies back, seen from the player's seat. */
export const TABLE_TILT = 50

/** A card left face up on the table after it was dealt and closed (solitaire-like row). */
function tableCard(vp: Viewport, t: number, nt: number) {
  const { cw, ch } = handCardSize(vp)
  const w = cw * 0.78
  const h = ch * 0.78
  const gap = vp.mobile ? 10 : 22
  const span = vp.w - (vp.mobile ? 32 : 160) - w
  const step = nt > 1 ? Math.min(w + gap, span / (nt - 1)) : 0
  const left = vp.w / 2 - (step * (nt - 1)) / 2 - w / 2 + t * step
  const top = Math.max(vp.h * (vp.mobile ? 0.37 : 0.35) - h / 2, areaTop(vp))
  return { top, left, width: w, height: h, angle: (((t * 37) % 11) - 5) * 1.2 }
}

export function handStyle(vp: Viewport, { v, n, openV, hoverV, gone, cards }: Slot): CSSProperties {
  const onTable = cards && cards.t >= 0
  const r = cards ? cards.r : n - 1 - v // reading order, left to right
  const c = onTable ? tableCard(vp, cards.t, cards.nt) : handCard(vp, r, cards ? cards.n : n)
  const ps = c.width / pageWidth(vp)
  const lift = v === hoverV ? c.height * (vp.mobile ? 0.14 : 0.18) : 0
  const s: CSSProperties = {
    ...pageVars(pageWidth(vp), ps, gridBarHeight(vp) - pageBarHeight(vp) * ps),
    ['--fa' as string]: `${c.angle}deg`,
    // About me sits on top and each card to its right tucks under the one before it;
    // applied only once the hand has landed (see index.css), so nothing jumps mid-flight
    ['--hz' as string]: onTable ? cards!.t + 1 : (cards ? cards.n : n) - r + 20,
    zIndex: v + 1,
    top: c.top,
    left: c.left,
    width: c.width,
    height: c.height,
    borderRadius: vp.mobile ? 10 : 14,
    // translate after the fan rotation, so a hovered card slides up out of the hand along its own axis;
    // cards on the table lie back on the felt (same tilt as a card being dealt onto it)
    transform: onTable
      ? `perspective(1600px) ${IY} rotateX(${TABLE_TILT}deg) translateY(${-lift}px)`
      : `${IY} translateY(${-lift}px) scale(${lift ? 1.04 : 1})`,
    transformOrigin: onTable ? '50% 50%' : undefined,
    boxShadow: lift ? '0 30px 60px rgba(0,0,0,.65)' : '0 12px 30px rgba(0,0,0,.55)',
  } as CSSProperties
  if (gone) return { ...s, transform: `${IY} translateY(${vp.h}px)`, opacity: 0, pointerEvents: 'none' }
  if (openV > -1) return { ...s, transform: `${IY} translateY(${c.height * 0.6}px)`, opacity: 0, pointerEvents: 'none' }
  return s
}
