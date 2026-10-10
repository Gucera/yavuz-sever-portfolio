import type { CSSProperties } from 'react'
import { IY, areaTop, clamp, dockSpace, gridBarHeight, pageBarHeight, pageVars, pageWidth, type Rect, type Slot, type Viewport } from './common'

/**
 * Grid view geometry: plain tabs as tiles, the projects collected in an iOS-style folder tile
 * (mini cards), and the expanded folder panel (large cards) when it is opened.
 */
export function gridGeometry(vp: Viewport, nTabs: number, nProjects: number, folderAt = nTabs) {
  const m = nTabs + (nProjects ? 1 : 0)
  // two columns on portrait phones; one row of up to four on anything wider, including
  // landscape phones, where two rows wouldn't fit between the header and the dock
  const cols = vp.w >= 700 || vp.w > vp.h ? Math.min(4, m) : 2
  const rows = Math.ceil(m / cols)
  const gap = vp.mobile ? 12 : 22
  const pad = vp.mobile ? 16 : clamp(vp.w * 0.03, 16, 48)
  const top0 = areaTop(vp)
  const availH = vp.h - top0 - (vp.mobile ? 20 : 36) - dockSpace(vp) // keep the dock clear
  const cw = (vp.w - pad * 2 - gap * (cols - 1)) / cols
  const ch = Math.max(60, Math.min((availH - gap * (rows - 1)) / rows, cw * 1.15))
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

  // closed folder: mini cards in a 2×2 grid (3×3 once there are more than four projects, like
  // iOS), leaving room for the label at the bottom
  const fc = nProjects > 4 ? 3 : 2
  const inset = Math.min(folder.width, folder.height) * 0.08
  const labelSpace = vp.mobile ? 26 : 40
  const g = inset * (fc === 3 ? 0.45 : 0.6)
  const mw = (folder.width - inset * 2 - g * (fc - 1)) / fc
  const mh = (folder.height - inset - (inset + labelSpace) - g * (fc - 1)) / fc
  const mini = (p: number): Rect => ({
    top: folder.top + inset + Math.floor(p / fc) * (mh + g),
    left: folder.left + inset + (p % fc) * (mw + g),
    width: mw,
    height: mh,
  })

  // open folder: a centred panel of large cards, 2 across (3 on wider screens once there are
  // more than four); an incomplete last row is centred
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
  const bc = !vp.mobile && nProjects > 4 ? 3 : 2
  const br = Math.max(2, Math.ceil(nProjects / bc))
  const bw = (pw - pi * 2 - pg * (bc - 1)) / bc
  const bh = (ph - titleSpace - pi - pg * (br - 1)) / br
  const big = (p: number): Rect => {
    const row = Math.floor(p / bc)
    const inRow = Math.min(bc, nProjects - row * bc)
    const offset = ((bc - inRow) * (bw + pg)) / 2
    return {
      top: panel.top + titleSpace + row * (bh + pg),
      left: panel.left + pi + offset + (p % bc) * (bw + pg),
      width: bw,
      height: bh,
    }
  }

  return { tile, folder, mini, panel, big }
}

/** Grid view: tabs side by side in reading order (About first), projects in a folder. */
export function gridStyle(vp: Viewport, { v, openV, hoverV, gone, grid }: Slot): CSSProperties {
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
