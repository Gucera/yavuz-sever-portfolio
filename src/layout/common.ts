import type { CSSProperties } from 'react'

/** headerBottom: where the header actually ends (it wraps onto more lines on narrow windows) */
export type Viewport = { w: number; h: number; mobile: boolean; headerBottom?: number }

/** 'terminal' keeps the cards in their stack places, hidden behind the command line */
export type ViewMode = 'stack' | 'grid' | 'cards' | 'terminal'

export const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v))

export const sidePad = (vp: Viewport) => (vp.mobile ? 16 : clamp(vp.w * 0.111, 24, 160))

/** Width the tab page is laid out at; grid cards show it scaled down like a thumbnail. */
export const pageWidth = (vp: Viewport) => vp.w - sidePad(vp) * 2

/**
 * --pw: page layout width, --ps: page scale (1 everywhere except grid thumbnails),
 * --pt: page offset, so a grid thumbnail starts just below the card's full-size tab bar.
 */
export const pageVars = (pw: number, ps: number, pt = 0) => ({ '--pw': `${pw}px`, '--ps': ps, '--pt': `${pt}px` }) as CSSProperties

/** Height of the full-size tab bar on grid cards, and of the page's own bar (see index.css). */
export const gridBarHeight = (vp: Viewport) => (vp.mobile ? 26 : 34)
export const pageBarHeight = (vp: Viewport) => (vp.mobile ? 38 : 42)

export type Slot = {
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
export const IY = 'translateY(var(--iy, 0px)) rotate(var(--fr, 0deg)) rotate(var(--fa, 0deg))'

/** Height reserved at the bottom of the grid view for the dock. */
export const dockSpace = (vp: Viewport) => (vp.mobile ? 78 : 96)

/** Where the content area starts: the designed offset, or lower when the header has wrapped. */
export const areaTop = (vp: Viewport) => Math.max(vp.h < 620 ? 112 : vp.mobile ? 214 : 190, (vp.headerBottom ?? 0) + (vp.mobile ? 14 : 22))

export type Rect = { top: number; left: number; width: number; height: number }
