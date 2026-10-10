import { useEffect, type MutableRefObject, type RefObject } from 'react'
import { flushSync } from 'react-dom'
import gsap from 'gsap'
import { TABS } from '../data'
import { gridGeometry, type ViewMode, type Viewport } from '../layout'
import { FOLDER_KEY, writeList } from '../app/util'

type Args = {
  editMode: boolean
  setEditMode: (on: boolean) => void
  view: ViewMode
  openIdx: number
  vp: Viewport
  stageRef: RefObject<HTMLElement | null>
  cardRefs: MutableRefObject<(HTMLDivElement | null)[]>
  plainTabs: number[]
  projectTabs: number[]
  /** the current tile order (kept in a ref so the drag always sees the latest) */
  orderRef: MutableRefObject<string[]>
  setGridOrder: (order: string[]) => void
}

const num = (v: string) => parseFloat(v) || 0

/** Grid edit mode: drag a tile (or the folder) to reorder; tap outside or Done to finish. */
export function useGridEdit({ editMode, setEditMode, view, openIdx, vp, stageRef, cardRefs, plainTabs, projectTabs, orderRef, setGridOrder }: Args) {
  useEffect(() => {
    if (!editMode) return
    if (view !== 'grid' || openIdx !== -1) return setEditMode(false)
    const stage = stageRef.current
    if (!stage) return
    const onDown = (e: PointerEvent) => {
      const target = e.target instanceof Element ? e.target.closest<HTMLElement>('.card[role="button"]:not(.card--project), .folder') : null
      if (!target) {
        if (!(e.target instanceof Element && e.target.closest('.edit-done, .dock'))) setEditMode(false)
        return
      }
      e.preventDefault()
      const isFolder = target.classList.contains('folder')
      const idx = cardRefs.current.indexOf(target as HTMLDivElement)
      const key = isFolder ? FOLDER_KEY : TABS[idx]?.title
      if (!key) return
      const els: HTMLElement[] = isFolder
        ? [target, ...projectTabs.map((i) => cardRefs.current[i]).filter((x): x is HTMLDivElement => !!x)]
        : [target]
      const base0 = { x: num(target.style.left), y: num(target.style.top) }
      const x0 = e.clientX
      const y0 = e.clientY
      els.forEach((el) => el.classList.add('is-dragging'))
      const move = (ev: PointerEvent) => {
        const dx = ev.clientX - x0
        const dy = ev.clientY - y0
        const order = orderRef.current
        const geo = gridGeometry(vp, plainTabs.length, projectTabs.length, Math.max(0, order.indexOf(FOLDER_KEY)))
        // which slot is the dragged tile's centre over?
        const cx = base0.x + dx + num(target.style.width) / 2
        const cy = base0.y + dy + num(target.style.height) / 2
        let best = 0
        let bestD = Infinity
        order.forEach((_, r) => {
          const t = geo.tile(r)
          const d = Math.hypot(t.left + t.width / 2 - cx, t.top + t.height / 2 - cy)
          if (d < bestD) {
            bestD = d
            best = r
          }
        })
        if (order.indexOf(key) !== best) {
          const next = order.filter((k) => k !== key)
          next.splice(best, 0, key)
          flushSync(() => setGridOrder(next))
        }
        // keep the tile under the finger even after its home slot moved
        const shiftX = base0.x - num(target.style.left)
        const shiftY = base0.y - num(target.style.top)
        els.forEach((el) => (el.style.translate = `${dx + shiftX}px ${dy + shiftY}px`))
      }
      const up = () => {
        window.removeEventListener('pointermove', move)
        window.removeEventListener('pointerup', up)
        window.removeEventListener('pointercancel', up)
        writeList('grid-order', orderRef.current)
        els.forEach((el) => {
          el.classList.remove('is-dragging')
          const [tx, ty] = (el.style.translate || '0px 0px').split(' ').map((v) => parseFloat(v) || 0)
          const p = { x: tx, y: ty }
          gsap.to(p, {
            x: 0,
            y: 0,
            duration: 0.35,
            ease: 'power3.out',
            onUpdate: () => (el.style.translate = `${p.x}px ${p.y}px`),
            onComplete: () => (el.style.translate = ''),
          })
        })
      }
      window.addEventListener('pointermove', move)
      window.addEventListener('pointerup', up)
      window.addEventListener('pointercancel', up)
    }
    stage.addEventListener('pointerdown', onDown, true)
    return () => stage.removeEventListener('pointerdown', onDown, true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editMode, view, openIdx, vp])
}
