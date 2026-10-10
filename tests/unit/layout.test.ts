import { describe, expect, it } from 'vitest'
import { areaTop, gridGeometry, handCard, type Viewport } from '../../src/layout'

const sizes: Viewport[] = [
  { w: 375, h: 812, mobile: true },
  { w: 390, h: 844, mobile: true },
  { w: 820, h: 1180, mobile: false },
  { w: 1440, h: 900, mobile: false },
  { w: 1920, h: 1080, mobile: false },
]
const overlap = (a: { top: number; left: number; width: number; height: number }, b: typeof a) =>
  a.left < b.left + b.width - 0.5 && b.left < a.left + a.width - 0.5 && a.top < b.top + b.height - 0.5 && b.top < a.top + a.height - 0.5

describe('areaTop', () => {
  it('keeps the designed offset, and moves down when the header wraps', () => {
    expect(areaTop({ w: 1440, h: 900, mobile: false })).toBe(190)
    expect(areaTop({ w: 1440, h: 900, mobile: false, headerBottom: 260 })).toBe(282)
    expect(areaTop({ w: 375, h: 812, mobile: true, headerBottom: 120 })).toBe(214)
  })
})

describe('gridGeometry', () => {
  for (const vp of sizes) {
    it(`lays out tiles and the folder without overlap at ${vp.w}x${vp.h}`, () => {
      const geo = gridGeometry(vp, 3, 5, 3)
      const tiles = [0, 1, 2, 3].map((r) => geo.tile(r))
      for (const t of tiles) {
        expect(t.left).toBeGreaterThanOrEqual(0)
        expect(t.left + t.width).toBeLessThanOrEqual(vp.w)
        expect(t.top).toBeGreaterThanOrEqual(areaTop(vp))
      }
      for (let a = 0; a < tiles.length; a++) for (let b = a + 1; b < tiles.length; b++) expect(overlap(tiles[a], tiles[b])).toBe(false)
    })
    it(`fits all five projects inside the folder at ${vp.w}x${vp.h}`, () => {
      const geo = gridGeometry(vp, 3, 5, 3)
      for (let p = 0; p < 5; p++) {
        const m = geo.mini(p)
        expect(m.left).toBeGreaterThanOrEqual(geo.folder.left)
        expect(m.left + m.width).toBeLessThanOrEqual(geo.folder.left + geo.folder.width + 0.5)
        expect(m.top + m.height).toBeLessThanOrEqual(geo.folder.top + geo.folder.height + 0.5)
        const b = geo.big(p)
        expect(b.left + b.width).toBeLessThanOrEqual(geo.panel.left + geo.panel.width + 0.5)
      }
    })
  }
})

describe('handCard', () => {
  for (const vp of sizes) {
    it(`fans the hand symmetrically and on screen at ${vp.w}x${vp.h}`, () => {
      const n = 8
      const cards = Array.from({ length: n }, (_, r) => handCard(vp, r, n))
      expect(cards[0].angle).toBeCloseTo(-cards[n - 1].angle)
      for (const c of cards) {
        expect(c.top).toBeGreaterThanOrEqual(areaTop(vp) - 1)
        expect(c.top).toBeLessThan(vp.h)
      }
    })
  }
})
