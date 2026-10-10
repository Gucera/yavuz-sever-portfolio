import type { CSSProperties } from 'react'
import { IY, pageVars, type Slot, type ViewMode, type Viewport } from './common'
import { stackStyle } from './stack'
import { gridStyle } from './grid'
import { handStyle } from './cards'

export * from './common'
export { gridGeometry } from './grid'
export { TABLE_TILT, handCard } from './cards'

/** Where a card sits: full screen when its tab is open, otherwise its slot in the current view. */
export function cardStyle(vp: Viewport, slot: Slot, mode: ViewMode = 'stack'): CSSProperties {
  if (slot.self) {
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
  return stackStyle(vp, slot) // the terminal keeps the cards in their stack places, hidden
}
