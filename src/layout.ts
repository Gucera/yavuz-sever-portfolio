import type { CSSProperties } from 'react'

export type Viewport = { w: number; h: number; mobile: boolean }

export type ViewMode = 'stack' | 'grid' | 'cards'

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v))

export const sidePad = (vp: Viewport) => (vp.mobile ? 16 : clamp(vp.w * 0.111, 24, 160))

/** Width the tab page is laid out at; grid cards show it scaled down like a thumbnail. */
const pageWidth = (vp: Viewport) => vp.w - sidePad(vp) * 2

/**
 * --pw: page layout width, --ps: page scale (1 everywhere except grid thumbnails),
 * --pt: page offset, so a grid thumbnail starts just below the card's full-size tab bar.
 */
const pageVars = (pw: number, ps: number, pt = 0) => ({ '--pw': `${pw}px`, '--ps': ps, '--pt': `${pt}px` }) as CSSProperties

/** Height of the full-size tab bar on grid cards, and of the page's own bar (see index.css). */
export const gridBarHeight = (vp: Viewport) => (vp.mobile ? 26 : 34)
const pageBarHeight = (vp: Viewport) => (vp.mobile ? 38 : 42)

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
  /** grid view only: where this tab sits (projects live in a folder) */
  grid?: GridSlot
  /** cards view only: position in the hand, or on the table once dealt and closed */
  cards?: CardsSlot
}

export type CardsSlot = {
  /** index in the hand (-1 when on the table) and hand size */
  r: number
  n: number
  /** index among the cards lying on the table (-1 when in the hand) and their count */
  t: number
  nt: number
}

export type GridSlot = {
  /** index within its group: plain tabs in reading order, or position inside the folder */
  r: number
  nTabs: number
  nProjects: number
  project: boolean
  folderOpen: boolean
  /** keep the folder's cards above the grid while it opens/closes */
  raised: boolean
  /** where the folder sits among the grid tiles (edit mode can move it) */
  folderAt: number
}

// Every transform starts with translateY(var(--iy)) so GSAP can drive the
// intro through a CSS variable without fighting React's inline transform.
// --fr is the tilt GSAP adds while cards fly between the stack and grid views.
// --fa is the card's angle in the fanned hand (cards view); 0 elsewhere.
const IY = 'translateY(var(--iy, 0px)) rotate(var(--fr, 0deg)) rotate(var(--fa, 0deg))'

/** Card geometry for the "night stack" layout and the side-by-side grid view. */
export function cardStyle(vp: Viewport, slot: Slot, mode: ViewMode = 'stack'): CSSProperties {
  const { v, n, openV, hoverV, self, gone } = slot
  if (self) {
    return {
      ...pageVars(vp.w, 1),
      top: 0,
      left: 0,
      width: vp.w,
      height: vp.h,
      transform: IY,
      borderRadius: 0,
      zIndex: 400,
      overflowY: 'auto',
      cursor: 'default',
      boxShadow: 'none',
    }
  }

  if (mode === 'grid') return gridStyle(vp, slot)
  if (mode === 'cards') return handStyle(vp, slot)

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

/** Height reserved at the bottom of the grid view for the dock. */
export const dockSpace = (vp: Viewport) => (vp.mobile ? 78 : 96)

/** Top of the card area: below the header, compact on short screens. */
const areaTop = (vp: Viewport) => (vp.h < 620 ? 112 : vp.mobile ? 214 : 190)

export type Rect = { top: number; left: number; width: number; height: number }

/**
 * Grid view geometry: plain tabs as tiles, the projects collected in an iOS-style folder tile
 * (2×2 mini cards), and the expanded folder panel (2×2 large cards) when it is opened.
 */
export function gridGeometry(vp: Viewport, nTabs: number, nProjects: number, folderAt = nTabs) {
  const m = nTabs + (nProjects ? 1 : 0)
  const cols = vp.w >= 700 ? Math.min(4, m) : 2
  const rows = Math.ceil(m / cols)
  const gap = vp.mobile ? 12 : 22
  const pad = vp.mobile ? 16 : clamp(vp.w * 0.03, 16, 48)
  const top0 = areaTop(vp)
  const availH = vp.h - top0 - (vp.mobile ? 20 : 36) - dockSpace(vp) // keep the dock clear
  const cw = (vp.w - pad * 2 - gap * (cols - 1)) / cols
  const ch = Math.max(90, Math.min((availH - gap * (rows - 1)) / rows, cw * 1.15))
  // centre the grid vertically in the space under the header
  const gridTop = top0 + Math.max(0, (availH - (rows * ch + gap * (rows - 1))) / 2) * (vp.mobile ? 0 : 0.6)

  const tile = (r: number): Rect => {
    const row = Math.floor(r / cols)
    const col = r % cols
    const inRow = row === rows - 1 ? m - row * cols : cols // centre an incomplete last row
    const offset = ((cols - inRow) * (cw + gap)) / 2
    return { top: gridTop + row * (ch + gap), left: pad + offset + col * (cw + gap), width: cw, height: ch }
  }
  const folder = tile(folderAt)

  // closed folder: 2×2 mini cards, leaving room for the label at the bottom
  const inset = Math.min(folder.width, folder.height) * 0.08
  const labelSpace = vp.mobile ? 26 : 40
  const g = inset * 0.6
  const mw = (folder.width - inset * 2 - g) / 2
  const mh = (folder.height - inset - (inset + labelSpace) - g) / 2
  const mini = (p: number): Rect => ({
    top: folder.top + inset + Math.floor(p / 2) * (mh + g),
    left: folder.left + inset + (p % 2) * (mw + g),
    width: mw,
    height: mh,
  })

  // open folder: a centred panel with a 2×2 grid of large cards
  const pw = vp.mobile ? vp.w - 32 : Math.min(vp.w - pad * 2, 1040)
  const titleSpace = vp.mobile ? 52 : 64
  const ph = Math.min(vp.h - top0 - 24, pw * (vp.mobile ? 1.55 : 0.68))
  const panel: Rect = {
    top: Math.max(top0 - (vp.mobile ? 40 : 30), (vp.h - ph) / 2),
    left: (vp.w - pw) / 2,
    width: pw,
    height: ph,
  }
  const pi = vp.mobile ? 12 : 22
  const pg = vp.mobile ? 12 : 20
  const bw = (pw - pi * 2 - pg) / 2
  const bh = (ph - titleSpace - pi - pg) / 2
  const big = (p: number): Rect => ({
    top: panel.top + titleSpace + Math.floor(p / 2) * (bh + pg),
    left: panel.left + pi + (p % 2) * (bw + pg),
    width: bw,
    height: bh,
  })

  return { tile, folder, mini, panel, big }
}

/** Grid view: tabs side by side in reading order (About first), projects in a folder. */
function gridStyle(vp: Viewport, { v, openV, hoverV, gone, grid }: Slot): CSSProperties {
  const g = grid ?? { r: 0, nTabs: 1, nProjects: 0, project: false, folderOpen: false, raised: false, folderAt: 1 }
  const geo = gridGeometry(vp, g.nTabs, g.nProjects, g.folderAt)
  const inFolder = g.project && !g.folderOpen
  const rect = g.project ? (g.folderOpen ? geo.big(g.r) : geo.mini(g.r)) : geo.tile(g.r)
  const lift = v === hoverV && !inFolder

  const ps = rect.width / pageWidth(vp)
  const s: CSSProperties = {
    ...pageVars(pageWidth(vp), ps, inFolder ? 0 : gridBarHeight(vp) - pageBarHeight(vp) * ps),
    // same depth order as the stack (nothing jumps forward mid-flight); an open folder's
    // cards sit above its panel and the blurred backdrop
    zIndex: g.project && g.raised ? 260 + g.r : v + 1,
    top: rect.top,
    left: rect.left,
    width: rect.width,
    height: rect.height,
    borderRadius: inFolder ? (vp.mobile ? 5 : 8) : 14,
    transform: `${IY} translateY(${lift ? -8 : 0}px)`,
    boxShadow: inFolder ? '0 3px 10px rgba(0,0,0,.35)' : lift ? '0 26px 50px rgba(0,0,0,.6)' : '0 16px 36px rgba(0,0,0,.5)',
  }
  if (gone) return { ...s, transform: `${IY} translateX(${-(vp.w + 60)}px) rotate(-8deg)`, opacity: 0, pointerEvents: 'none' }
  if (openV > -1) return { ...s, transform: `${IY} scale(.94)`, opacity: 0, pointerEvents: 'none' }
  return s
}

/** Playing-card size for the cards view (portrait, 5:7). */
const handCardSize = (vp: Viewport) => {
  const ch = vp.mobile ? clamp(vp.h * 0.3, 170, 236) : clamp(vp.h * 0.5, 260, 440)
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

/** A card left face up on the table after it was dealt and closed (solitaire-like row). */
function tableCard(vp: Viewport, t: number, nt: number) {
  const { cw, ch } = handCardSize(vp)
  const w = cw * 0.62
  const h = ch * 0.62
  const gap = vp.mobile ? 10 : 22
  const span = vp.w - (vp.mobile ? 32 : 160) - w
  const step = nt > 1 ? Math.min(w + gap, span / (nt - 1)) : 0
  const left = vp.w / 2 - (step * (nt - 1)) / 2 - w / 2 + t * step
  const top = vp.h * (vp.mobile ? 0.36 : 0.33) - h / 2
  return { top, left, width: w, height: h, angle: (((t * 37) % 11) - 5) * 1.2 }
}

function handStyle(vp: Viewport, { v, n, openV, hoverV, gone, cards }: Slot): CSSProperties {
  const onTable = cards && cards.t >= 0
  const r = cards ? cards.r : n - 1 - v // reading order, left to right
  const c = onTable ? tableCard(vp, cards.t, cards.nt) : handCard(vp, r, cards ? cards.n : n)
  const ps = c.width / pageWidth(vp)
  const lift = v === hoverV ? c.height * (vp.mobile ? 0.14 : 0.18) : 0
  const s: CSSProperties = {
    ...pageVars(pageWidth(vp), ps, gridBarHeight(vp) - pageBarHeight(vp) * ps),
    ['--fa' as string]: `${c.angle}deg`,
    // like a real hand, each card overlaps the one to its left so every corner index shows;
    // applied only once the hand has landed (see index.css), so nothing jumps mid-flight
    ['--hz' as string]: onTable ? cards!.t + 1 : r + 20,
    zIndex: v + 1,
    top: c.top,
    left: c.left,
    width: c.width,
    height: c.height,
    borderRadius: vp.mobile ? 10 : 14,
    // translate after the fan rotation, so a hovered card slides up out of the hand along its own axis
    transform: `${IY} translateY(${-lift}px) scale(${lift ? 1.04 : 1})`,
    boxShadow: lift ? '0 30px 60px rgba(0,0,0,.65)' : '0 12px 30px rgba(0,0,0,.55)',
  } as CSSProperties
  if (gone) return { ...s, transform: `${IY} translateY(${vp.h}px)`, opacity: 0, pointerEvents: 'none' }
  if (openV > -1) return { ...s, transform: `${IY} translateY(${c.height * 0.6}px)`, opacity: 0, pointerEvents: 'none' }
  return s
}
