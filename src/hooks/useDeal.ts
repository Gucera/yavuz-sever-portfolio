import { useLayoutEffect, useRef, useState, type MutableRefObject, type RefObject } from 'react'
import { flushSync } from 'react-dom'
import gsap from 'gsap'
import { TABLE_TILT, cardStyle, type Slot, type Viewport } from '../layout'
import { reducedMotion } from '../app/util'

type Args = {
  vp: Viewport
  flying: boolean
  slotOf: (i: number) => Slot
  tableTabs: number[]
  cardRefs: MutableRefObject<(HTMLDivElement | null)[]>
  stageRef: RefObject<HTMLElement | null>
  /** a dealt card opens in place: the content reveal is skipped */
  skipReveal: MutableRefObject<boolean>
  setOpenIdx: (i: number) => void
  setOnTable: (fn: (t: number[]) => number[]) => void
  setFlipped: (fn: (f: number[]) => number[]) => void
  setHoverIdx: (i: number) => void
}

type From = { top: number; left: number; width: number; height: number; fa: number; rx: number; pt: number }
const num = (v: string) => parseFloat(v) || 0

/**
 * Cards view: picking a card deals it onto the table, then the camera drops onto it from
 * above until it fills the screen and the tab opens.
 */
export function useDeal({ vp, flying, slotOf, tableTabs, cardRefs, stageRef, skipReveal, setOpenIdx, setOnTable, setFlipped, setHoverIdx }: Args) {
  const [dealing, setDealing] = useState(-1)
  const dealFrom = useRef<From | null>(null)
  /** the card last dealt, so it can stay face up on the table once its tab is closed */
  const lastDealt = useRef(-1)

  const dealCard = (i: number) => {
    if (dealing !== -1 || flying) return
    const el = cardRefs.current[i]
    if (el) {
      dealFrom.current = {
        top: num(el.style.top),
        left: num(el.style.left),
        width: num(el.style.width),
        height: num(el.style.height),
        fa: num(el.style.getPropertyValue('--fa')),
        rx: el.classList.contains('card--table') ? TABLE_TILT : 0,
        pt: num(getComputedStyle(el).getPropertyValue('--pt')),
      }
    }
    // it joins the cards on the table now: the others slide over to make room for it
    setOnTable((t) => (t.includes(i) ? t : [...t, i]))
    lastDealt.current = i
    setFlipped((f) => f.filter((x) => x !== i))
    if (reducedMotion()) return setOpenIdx(i)
    setHoverIdx(-1)
    setDealing(i)
  }

  useLayoutEffect(() => {
    if (dealing === -1) return
    const i = dealing
    const el = cardRefs.current[i]
    const page = el?.querySelector<HTMLElement>('.card__page')
    if (!el || !page) {
      setDealing(-1)
      setOpenIdx(i)
      return
    }
    const start = dealFrom.current ?? {
      top: num(el.style.top),
      left: num(el.style.left),
      width: num(el.style.width),
      height: num(el.style.height),
      fa: 0,
      rx: 0,
      pt: num(getComputedStyle(el).getPropertyValue('--pt')),
    }
    dealFrom.current = null
    const from = { top: start.top, left: start.left, width: start.width, height: start.height }
    const pt = start.pt
    const st = { fa: start.fa, lift: 0, rx: start.rx, s: 1 }
    gsap.set(el, from) // React already moved it to its table slot; start from the hand
    const apply = () => {
      el.style.transform = `perspective(1600px) rotate(${st.fa}deg) translateY(${st.lift}px) rotateX(${st.rx}deg) scale(${st.s})`
    }
    // where the card lands: its slot in the row of cards already on the table
    const slot = cardStyle(vp, { ...slotOf(i), hoverV: -1 }, 'cards') as Record<string, unknown>
    const table = { top: num(String(slot.top)), left: num(String(slot.left)), width: num(String(slot.width)), height: num(String(slot.height)) }
    const placed = num(String(slot['--fa'] ?? 0))
    // the other cards on the table stay in shot and are carried by the camera too
    const others = tableTabs
      .filter((k) => k !== i)
      .map((k) => {
        const o = cardRefs.current[k]
        const r = cardStyle(vp, { ...slotOf(k), hoverV: -1 }, 'cards') as Record<string, unknown>
        return {
          el: o,
          page: o?.querySelector<HTMLElement>('.card__page') ?? null,
          rect: { top: num(String(r.top)), left: num(String(r.left)), width: num(String(r.width)), height: num(String(r.height)) },
          ps: Number(r['--ps'] ?? 1),
          pt: num(String(r['--pt'] ?? 0)),
        }
      })
      .filter((o): o is typeof o & { el: HTMLDivElement } => !!o.el)

    el.dataset.dealt = '1'
    gsap.set(el, { transformOrigin: '50% 50%', zIndex: 500 })
    // Lay the page out at its final, full-screen width from the start, so nothing re-flows when
    // the tab opens at the end; the card just shows it scaled down.
    gsap.set(page, { width: vp.w, minHeight: vp.h, y: pt, scale: from.width / vp.w, transformOrigin: '0 0' })
    apply()

    const tableEl = stageRef.current?.querySelector<HTMLElement>('.table') ?? null
    const tl = gsap.timeline({
      onComplete: () => {
        // Hand over to the real open tab in the same frame: it has the same size, layout and
        // position as the card now, so the page simply carries on (no reveal replay).
        skipReveal.current = true
        flushSync(() => {
          setOpenIdx(i)
          setDealing(-1)
        })
        if (tableEl) gsap.set(tableEl, { clearProps: 'transform,transformOrigin' })
        for (const o of others) {
          delete o.el.dataset.follow
          Object.assign(o.el.style, {
            top: `${o.rect.top}px`,
            left: `${o.rect.left}px`,
            width: `${o.rect.width}px`,
            height: `${o.rect.height}px`,
          })
          if (o.page) gsap.set(o.page, { clearProps: 'transform' })
        }
        delete el.dataset.dealt
        delete el.dataset.camera
        gsap.set(page, { clearProps: 'transform,width,minHeight' })
        gsap.set(el, { clearProps: 'transformOrigin' })
      },
    })
    // 1. straight from the hand onto the table: a short arc while it tips back and lies down
    tl.to(el, { ...table, duration: 0.6, ease: 'power3.out' })
    tl.to(page, { scale: table.width / vp.w, duration: 0.6, ease: 'power3.out' }, '<') // thumbnail follows the card's size
    tl.to(
      st,
      {
        keyframes: {
          lift: [0, -from.height * 0.18, 0],
          fa: [st.fa, (st.fa + placed) / 2, placed],
          rx: [st.rx, (st.rx + TABLE_TILT) / 2, TABLE_TILT],
          easeEach: 'sine.inOut',
        },
        duration: 0.6,
        ease: 'power2.out',
        onUpdate: apply,
      },
      0, // with the move, from the first frame
    )
    // 2. the card stays on the table and the CAMERA moves in: the table is zoomed towards the
    //    card while the view swings overhead (the card squares up and flattens). The card is
    //    re-laid-out at its on-screen size every frame instead of being scaled as a bitmap, so
    //    its text stays sharp. The camera settles on the top of the card: the page as it opens.
    const cx = table.left + table.width / 2
    const cy = table.top + table.height / 2
    const Z = vp.w / table.width
    const cam = { z: 1, dx: 0, dy: 0 }
    const target = { z: Z, dx: vp.w / 2 - cx, dy: (table.height * Z) / 2 - cy }
    if (tableEl) {
      const tr = tableEl.getBoundingClientRect()
      gsap.set(tableEl, { transformOrigin: `${cx - tr.left}px ${cy - tr.top}px` })
    }
    const shoot = () => {
      if (tableEl) gsap.set(tableEl, { x: cam.dx, y: cam.dy, scale: cam.z })
      for (const o of others) {
        o.el.dataset.follow = '1'
        o.el.style.left = `${cx + cam.dx + (o.rect.left - cx) * cam.z}px`
        o.el.style.top = `${cy + cam.dy + (o.rect.top - cy) * cam.z}px`
        o.el.style.width = `${o.rect.width * cam.z}px`
        o.el.style.height = `${o.rect.height * cam.z}px`
        if (o.page) gsap.set(o.page, { y: o.pt * cam.z, scale: o.ps * cam.z, transformOrigin: '0 0' })
      }
      const w = table.width * cam.z
      const h = table.height * cam.z
      el.style.width = `${w}px`
      el.style.height = `${h}px`
      el.style.left = `${cx + cam.dx - w / 2}px`
      el.style.top = `${cy + cam.dy - h / 2}px`
      gsap.set(page, { scale: w / vp.w })
    }
    tl.call(() => {
      el.dataset.camera = '1' // fades the card's cream border and corners as we close in
    }, undefined, '+=0.04')
    tl.to(cam, { ...target, duration: 0.75, ease: 'power3.inOut', onUpdate: shoot }, '<')
    tl.to(st, { rx: 0, fa: 0, duration: 0.75, ease: 'power3.inOut', onUpdate: apply }, '<')
    tl.to(el, { borderRadius: 0, duration: 0.75, ease: 'power3.inOut' }, '<')
    // the thumbnail sat under the card's tab bar; the open page starts at the very top
    tl.to(page, { y: 0, duration: 0.75, ease: 'power3.inOut' }, '<')
    return () => {
      tl.kill()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dealing])

  return { dealing, dealCard, lastDealt }
}
