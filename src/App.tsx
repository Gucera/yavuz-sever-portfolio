import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import type React from 'react'
import { flushSync } from 'react-dom'
import gsap from 'gsap'
import { Analytics } from '@vercel/analytics/react'
import { INCOGNITO, PROFILE, TABS, isProject } from './data'
import { bestHand } from './poker'
import { search } from './search'
import { haptic, isSoundOn, play, setSoundOn } from './sound'
import { TABLE_TILT, cardStyle, gridGeometry, sidePad, type ViewMode, type Viewport } from './layout'
import { TabCard } from './TabCard'

const MOBILE_BP = 768

const readViewport = (): Viewport => ({
  w: window.innerWidth,
  h: window.innerHeight,
  mobile: window.innerWidth < MOBILE_BP,
})

function useViewport(): Viewport {
  const [vp, setVp] = useState(readViewport)
  useEffect(() => {
    const onResize = () => setVp(readViewport())
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])
  return vp
}

export const tabSlug = (title: string) =>
  title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

/** Path for a tab: /quick-label, or / for the stack/grid. */
const tabPath = (idx: number) => (TABS[idx] ? `/${tabSlug(TABS[idx].title)}` : '/')

/**
 * Which tab the address points at. Tabs live at real paths (/quick-label) so analytics
 * report them as separate pages; old #quick-label links still work.
 */
const tabFromLocation = () => {
  const find = (slug: string) => (slug ? TABS.findIndex((t) => tabSlug(t.title) === slug) : -1)
  const fromPath = find(decodeURIComponent(location.pathname.replace(/^\/+|\/+$/g, '')))
  return fromPath !== -1 ? fromPath : find(decodeURIComponent(location.hash.slice(1)))
}

const VIEWS: [ViewMode, string, string][] = [
  ['stack', '▤', 'Stack'],
  ['grid', '▦', 'Grid'],
  ['cards', '♠', 'Cards'],
]

const RANKS = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K']
const SUITS = ['♠', '♥', '♦', '♣']

/**
 * Deals every tab a different playing card at random (no jokers). About me is always the
 * King of Spades — in the cards view its preview shows a king instead of the portrait.
 */
const dealHand = () => {
  const deck = RANKS.flatMap((rank) => SUITS.map((suit) => ({ rank, suit })))
    .filter((c) => !(c.rank === 'K' && c.suit === '♠'))
    .sort(() => Math.random() - 0.5)
  return TABS.map((t, i) => (t.extra === 'about' ? { rank: 'K', suit: '♠' } : deck[i]))
}

const readList = (key: string): string[] => {
  try {
    const v = JSON.parse(localStorage.getItem(key) ?? '[]')
    return Array.isArray(v) ? v.filter((x) => typeof x === 'string') : []
  } catch {
    return []
  }
}
const writeList = (key: string, list: string[]) => {
  try {
    localStorage.setItem(key, JSON.stringify(list))
  } catch {
    // storage blocked: not remembered, nothing else breaks
  }
}

const FOLDER_KEY = '__folder'

const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

export default function App() {
  const vp = useViewport()
  const [openIdx, setOpenIdx] = useState(tabFromLocation)
  const [gone, setGone] = useState<number[]>([])
  const [introDone, setIntroDone] = useState(false)
  const [hoverIdx, setHoverIdx] = useState(-1)
  const [view, setView] = useState<ViewMode>('stack')
  const [flying, setFlying] = useState(false)
  const [landing, setLanding] = useState(false)
  // grid view: the projects live in an iOS-style folder
  const [folderOpen, setFolderOpen] = useState(false)
  const [folderRaised, setFolderRaised] = useState(false)
  // cards view: the tab being dealt onto the table (-1 when none)
  const [dealing, setDealing] = useState(-1)
  const [hand, setHand] = useState(dealHand) // playing cards shown on the tabs in the cards view
  // cards view on touch screens: the first tap picks a card (it stays lifted), the second deals it
  const [picked, setPicked] = useState(-1)
  // stack: Option/Ctrl+Tab switcher (index into the visible tabs while it's open)
  const [switcher, setSwitcher] = useState<number | null>(null)
  // grid: iOS edit mode (jiggle + drag to reorder), saved tile order, tabs already opened
  const [editMode, setEditMode] = useState(false)
  const [gridOrder, setGridOrder] = useState(() => readList('grid-order'))
  const [opened, setOpened] = useState(() => readList('opened-tabs'))
  // grid: Spotlight search
  const [spot, setSpot] = useState(false)
  // macOS-style dock magnification: every icon grows by how close the pointer is to it, so the
  // neighbours swell too and the row parts smoothly instead of one icon popping up
  const dockRef = useRef<HTMLElement>(null)
  const magnify = (e: React.PointerEvent) => {
    const dock = dockRef.current
    if (!dock || e.pointerType !== 'mouse') return
    const items = [...dock.children] as HTMLElement[]
    const base = 52
    const gap = parseFloat(getComputedStyle(dock).columnGap) || 0
    const r = dock.getBoundingClientRect()
    const left = r.left + r.width / 2 - (items.length * base + (items.length - 1) * gap) / 2
    items.forEach((it, k) => {
      const d = Math.abs(e.clientX - (left + k * (base + gap) + base / 2)) / (base * 2.6)
      const m = d >= 1 ? 0 : Math.cos((d * Math.PI) / 2)
      gsap.to(it, { '--m': m, duration: 0.2, ease: 'power2.out', overwrite: true })
    })
  }
  const unmagnify = () => {
    const items = dockRef.current ? [...dockRef.current.children] : []
    gsap.to(items, { '--m': 0, duration: 0.45, ease: 'power3.out', overwrite: true })
  }
  const [query, setQuery] = useState('')
  // cards: flipped cards, the one mid-flip, cards left on the table, toast, shuffle, sound
  const [flipped, setFlipped] = useState<number[]>([])
  const [flipping, setFlipping] = useState(-1)
  const [onTable, setOnTable] = useState<number[]>([])
  const [toast, setToast] = useState<string | null>(null)
  const [shuffling, setShuffling] = useState(false)
  const [soundOn, setSoundState] = useState(isSoundOn)
  const lastDealt = useRef(-1)
  const dealFrom = useRef<{ top: number; left: number; width: number; height: number; fa: number; rx: number; pt: number } | null>(null)
  const lastFlip = useRef(0)
  const skipReveal = useRef(false) // a dealt card opens in place: don't replay the content reveal
  const flightFrom = useRef<React.CSSProperties[] | null>(null)
  const fadingRef = useRef<Element[]>([]) // back-of-stack content faded out during a flight

  const stageRef = useRef<HTMLElement>(null)
  const stackRef = useRef<HTMLDivElement>(null)
  const cardRefs = useRef<(HTMLDivElement | null)[]>([])

  const visible = TABS.map((_, i) => i).filter((i) => !gone.includes(i))
  const n = visible.length
  // TABS is in reading order; the first tab sits at the front of the stack.
  const stackPos = (i: number) => n - 1 - visible.indexOf(i)
  const openV = openIdx === -1 ? -1 : stackPos(openIdx)
  const lifted = view === 'cards' && picked !== -1 ? picked : hoverIdx // a picked card stays up
  const hoverV = openIdx === -1 && lifted !== -1 && !gone.includes(lifted) ? stackPos(lifted) : -1
  const plainTabs = visible.filter((i) => !isProject(TABS[i]))
  const projectTabs = visible.filter((i) => isProject(TABS[i]))
  // grid tiles in their (possibly user-arranged) order: plain tabs plus the projects folder
  const gridKeys = [...plainTabs.map((i) => TABS[i].title), ...(projectTabs.length ? [FOLDER_KEY] : [])]
  const rankOf = (k: string) => (gridOrder.includes(k) ? gridOrder.indexOf(k) : 1000 + gridKeys.indexOf(k))
  const orderedKeys = [...gridKeys].sort((a, b) => rankOf(a) - rankOf(b))
  const folderAt = Math.max(0, orderedKeys.indexOf(FOLDER_KEY))
  const orderRef = useRef(orderedKeys)
  orderRef.current = orderedKeys
  // cards view: the hand, and the cards left face up on the table
  const tableTabs = onTable.filter((i) => visible.includes(i))
  const handTabs = visible.filter((i) => !tableTabs.includes(i))
  const slotOf = (i: number) => {
    const isGone = gone.includes(i)
    const project = isProject(TABS[i])
    const grid = {
      r: Math.max(0, project ? projectTabs.indexOf(i) : orderedKeys.indexOf(TABS[i].title)),
      nTabs: plainTabs.length,
      nProjects: projectTabs.length,
      project,
      folderOpen,
      raised: folderRaised,
      folderAt,
    }
    const cards = { r: Math.max(0, handTabs.indexOf(i)), n: handTabs.length, t: tableTabs.indexOf(i), nt: tableTabs.length }
    return { v: isGone ? n : stackPos(i), n, openV, hoverV, self: openIdx === i, gone: isGone, grid, cards }
  }

  // A tap on the table (anywhere but a card) puts a picked card back; so does leaving the view.
  useEffect(() => {
    if (picked === -1) return
    if (view !== 'cards' || openIdx !== -1) return setPicked(-1)
    const onDown = (e: PointerEvent) => {
      if (!(e.target instanceof Element) || !e.target.closest('.card')) setPicked(-1)
    }
    window.addEventListener('pointerdown', onDown)
    return () => window.removeEventListener('pointerdown', onDown)
  }, [picked, view, openIdx])

  // The folder's cards stay above the grid until the close animation has finished.
  useEffect(() => {
    if (folderOpen) return setFolderRaised(true)
    const t = window.setTimeout(() => setFolderRaised(false), 700)
    return () => window.clearTimeout(t)
  }, [folderOpen])

  // Switch between the stack and the grid: remember where every card is now, then let the
  // layout effect below fly each one along an arc to its new place.
  const toggleView = (next: ViewMode) => {
    if (openIdx !== -1 || flying || dealing !== -1 || next === view) return
    if (folderOpen) setFolderOpen(false)
    setEditMode(false)
    setOnTable([])
    setFlipped([])
    if (next === 'cards') {
      setHand(dealHand()) // a fresh, random hand every time
      play('shuffle')
    }
    if (!reducedMotion()) {
      flightFrom.current = TABS.map((_, i) => cardStyle(vp, { ...slotOf(i), hoverV: -1 }, view))
      setFlying(true)
    }
    setHoverIdx(-1)
    setView(next)
  }

  // Intro: header letters rise, then the tabs slide up into the stack.
  useLayoutEffect(() => {
    if (reducedMotion()) {
      setIntroDone(true)
      return
    }
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ onComplete: () => setIntroDone(true) })
      tl.from('.header__name .ch', { yPercent: 110, duration: 0.8, ease: 'power4.out', stagger: 0.025 })
        .from('.header__role, .header__meta > *', { opacity: 0, y: 10, duration: 0.5, stagger: 0.08 }, '-=0.5')
        .fromTo(
          cardRefs.current.filter(Boolean).reverse(),
          { '--iy': `${window.innerHeight}px` },
          { '--iy': '0px', duration: 1.1, ease: 'expo.out', stagger: 0.09 },
          '-=0.55',
        )
    }, stageRef)
    return () => ctx.revert()
  }, [])

  // Reveal the content of a freshly opened tab.
  useEffect(() => {
    if (openIdx < 0) return
    const el = cardRefs.current[openIdx]
    if (!el) return
    el.focus({ preventScroll: true })
    if (skipReveal.current) {
      skipReveal.current = false
      return
    }
    if (reducedMotion()) return
    const ctx = gsap.context(() => {
      gsap.from('[data-reveal]', { y: 36, opacity: 0, duration: 0.7, ease: 'power3.out', stagger: 0.06, delay: 0.3 })
    }, el)
    return () => ctx.revert()
  }, [openIdx])

  // Subtle 3D tilt of the whole stack following the mouse (desktop only; touch devices stay still).
  useEffect(() => {
    const stack = stackRef.current
    if (!stack || reducedMotion() || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return
    if (dealing !== -1) return // the deal animation drives the stack (camera) itself
    gsap.set(stack, { transformPerspective: 1800, transformOrigin: '50% 30%' })
    if (openIdx !== -1) {
      gsap.to(stack, { rotationX: 0, rotationY: 0, duration: 0.6, ease: 'power3.out' })
      return
    }
    const rx = gsap.quickTo(stack, 'rotationX', { duration: 0.9, ease: 'power3.out' })
    const ry = gsap.quickTo(stack, 'rotationY', { duration: 0.9, ease: 'power3.out' })
    const onMove = (e: PointerEvent) => {
      ry((e.clientX / window.innerWidth - 0.5) * 5)
      rx(-(e.clientY / window.innerHeight - 0.5) * 3)
    }
    const onLeave = () => {
      rx(0)
      ry(0)
    }
    window.addEventListener('pointermove', onMove)
    document.addEventListener('pointerleave', onLeave)
    return () => {
      window.removeEventListener('pointermove', onMove)
      document.removeEventListener('pointerleave', onLeave)
    }
  }, [openIdx, dealing])

  useLayoutEffect(() => {
    const from = flightFrom.current
    if (!from) return
    flightFrom.current = null
    const px = (v: unknown) => Number(v) || 0
    // back of the stack lifts off first; each card swings up and to the right, tilting as it flies
    const order = visible.slice().reverse()
    const pages: Element[] = []
    const root = document.documentElement
    root.dataset.flying = '1' // lets heavy loops (the 3D crest) pause mid-flight
    // Landing is spread over two frames so it doesn't land on one: first hand the page
    // scale back to CSS (--ps already holds the final value), then end the flight.
    const land = () => {
      gsap.set(pages, { clearProps: 'transform,minHeight' })
      requestAnimationFrame(() => {
        delete root.dataset.flying
        setLanding(true)
        setFlying(false)
        window.setTimeout(() => setLanding(false), 450)
      })
    }
    const tl = gsap.timeline({ onComplete: land })
    // Flying back into the stack: the tabs that end up behind the front one only show their
    // bar there, so fade their content out gradually during the flight — no pop on landing.
    const fading: Element[] = (fadingRef.current =
      view === 'stack'
        ? visible
            .filter((i) => stackPos(i) !== n - 1)
            .flatMap((i) => [...(cardRefs.current[i]?.querySelectorAll('.card__page > :not(.card__bar)') ?? [])])
        : [])
    if (fading.length) tl.fromTo(fading, { opacity: 1 }, { opacity: 0.002, duration: 0.9, ease: 'power1.inOut' }, 0.3)
    order.forEach((i, k) => {
      const el = cardRefs.current[i]
      const f = from[i]
      const t = cardStyle(vp, { ...slotOf(i), hoverV: -1 }, view)
      if (!el) return
      const [ft, fl, fw, fh] = [px(f.top), px(f.left), px(f.width), px(f.height)]
      const [tt, tlft, tw, th] = [px(t.top), px(t.left), px(t.width), px(t.height)]
      const lift = 90 + k * 22
      const swing = (vp.mobile ? 60 : 160) * (view === 'grid' ? 1 : -1)
      const tilt = (k % 2 ? 1 : -1) * (5 + k * 1.5)
      const fs = Number((f as Record<string, unknown>)['--ps'] ?? 1)
      const ts = Number((t as Record<string, unknown>)['--ps'] ?? 1)
      const fy = parseFloat(String((f as Record<string, unknown>)['--pt'] ?? 0)) || 0
      const ty = parseFloat(String((t as Record<string, unknown>)['--pt'] ?? 0)) || 0
      const fa = parseFloat(String((f as Record<string, unknown>)['--fa'] ?? 0)) || 0
      const ta = parseFloat(String((t as Record<string, unknown>)['--fa'] ?? 0)) || 0
      gsap.set(el, { top: ft, left: fl, width: fw, height: fh, '--fr': '0deg', '--fa': `${fa}deg` })
      // Scale the page element itself (not the inherited --ps) and pin its height, so the
      // tab content is neither restyled nor re-laid-out on every frame.
      const page = el.querySelector('.card__page')
      if (page) {
        pages.push(page)
        gsap.set(page, { minHeight: Math.max(fh / fs, th / ts), y: fy, scale: fs, transformOrigin: '0 0' })
        tl.to(
          page,
          { keyframes: { y: [fy, (fy + ty) / 2, ty], scale: [fs, (fs + ts) / 2, ts], easeEach: 'sine.inOut' }, duration: 1.15, ease: 'power2.inOut' },
          k * 0.07,
        )
      }
      tl.to(
        el,
        {
          keyframes: {
            top: [ft, Math.min(ft, tt) - lift, tt],
            left: [fl, (fl + tlft) / 2 + swing, tlft],
            width: [fw, (fw + tw) / 2, tw],
            height: [fh, (fh + th) / 2, th],
            '--fr': ['0deg', `${tilt}deg`, '0deg'],
            '--fa': [`${fa}deg`, `${(fa + ta) / 2}deg`, `${ta}deg`],
            easeEach: 'sine.inOut',
          },
          duration: 1.15,
          ease: 'power2.inOut',
        },
        k * 0.07,
      )
    })
    return () => {
      tl.kill()
      delete root.dataset.flying
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view])

  // Tabs behind the front one keep their content hidden, so the browser never decodes their
  // images until the first stack -> grid flight reveals them mid-air. Decode them while idle.
  useEffect(() => {
    if (!introDone) return
    const warm = () =>
      cardRefs.current.forEach((el) => el?.querySelectorAll('img').forEach((img) => img.decode?.().catch(() => {})))
    const idle = window.requestIdleCallback ?? ((cb: () => void) => window.setTimeout(cb, 300))
    idle(warm)
  }, [introDone])

  // Cards view: picking a card deals it onto the table, then the camera drops onto it from
  // above until it fills the screen and the tab opens.
  const dealCard = (i: number) => {
    if (dealing !== -1 || flying) return
    const el = cardRefs.current[i]
    if (el) {
      const num = (v: string) => parseFloat(v) || 0
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
    play('draw')
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
    const num = (v: string) => parseFloat(v) || 0
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
    tl.call(() => {
      play('place')
      haptic()
    }, undefined, 0.54)
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

  // After landing in the stack, .card--back already hides back content (same opacity), so the
  // inline fade can go without a visible change — and hover previews work again.
  useEffect(() => {
    if (flying || !fadingRef.current.length) return
    gsap.set(fadingRef.current, { clearProps: 'opacity' })
    fadingRef.current = []
  }, [flying])

  // Remember which tabs this visitor has opened (the grid shows a "new" dot on the others).
  useEffect(() => {
    if (openIdx === -1) return
    const title = TABS[openIdx].title
    setOpened((o) => {
      if (o.includes(title)) return o
      const next = [...o, title]
      writeList('opened-tabs', next)
      return next
    })
  }, [openIdx])

  // Cards view: a dealt card that gets closed stays face up on the table.
  const prevOpen = useRef(openIdx)
  useEffect(() => {
    const prev = prevOpen.current
    prevOpen.current = openIdx
    if (openIdx !== -1 || prev === -1 || view !== 'cards' || lastDealt.current !== prev) return
    lastDealt.current = -1
    setOnTable((t) => (t.includes(prev) ? t : [...t, prev]))
  }, [openIdx, view])

  // Cards view: a straight or better in the dealt hand is an easter egg.
  useEffect(() => {
    if (view !== 'cards') return
    const best = bestHand(handTabs.map((i) => hand[i]))
    if (!best) return
    const t1 = window.setTimeout(() => setToast(`${best}! You found an easter egg.`), 900)
    const t2 = window.setTimeout(() => setToast(null), 5200)
    return () => {
      window.clearTimeout(t1)
      window.clearTimeout(t2)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hand, view])

  // Cards view: a dealer's riffle shuffle. The cards gather face down into a tidy deck, the
  // deck is cut into two halves, the halves riffle back together card by card, the deck is
  // squared up and the new hand is spread back out into the fan, each card turning face up.
  // Driven by the individual translate/rotate/scale properties so it never fights the layout
  // transform React writes.
  const shuffle = () => {
    if (shuffling || dealing !== -1) return
    setPicked(-1)
    setHoverIdx(-1)
    if (reducedMotion()) {
      setOnTable([])
      setFlipped([])
      setHand(dealHand())
      return
    }
    setShuffling(true)
    setFlipped([]) // faces are turned by the data-facedown attribute below, without re-rendering
    const ids = visible.filter((i) => cardRefs.current[i])
    const els = ids.map((i) => cardRefs.current[i]!)
    const n = els.length
    const deck = { x: vp.w / 2, y: vp.h * (vp.mobile ? 0.58 : 0.6) }
    const S = 0.82 // the deck is a little smaller than the fanned hand
    const centre = (el: HTMLElement) => ({
      x: (parseFloat(el.style.left) || 0) + (parseFloat(el.style.width) || 0) / 2,
      y: (parseFloat(el.style.top) || 0) + (parseFloat(el.style.height) || 0) / 2,
    })
    const cw = (parseFloat(els[0]?.style.width ?? '') || 200) * S
    const thick = vp.mobile ? 1.2 : 1.6 // px between cards in the pile, so it reads as a deck
    const st = els.map((el, k) => {
      const c = centre(el)
      // g: how far into the deck (0 = in the hand, 1 = on the pile); dx/dy: offset on the pile
      // fa: the card's fan angle, cancelled on the pile so the deck sits square
      const fa = parseFloat(el.style.getPropertyValue('--fa')) || 0
      return { g: 0, dx: 0, dy: -k * thick, r: 0, sx: 1, s: 1, fa, ox: deck.x - c.x, oy: deck.y - c.y }
    })
    const draw = (k: number) => {
      const el = els[k]
      const p = st[k]
      el.style.translate = `${p.ox * p.g + p.dx}px ${p.oy * p.g + p.dy * p.g}px`
      el.style.rotate = `${p.r - p.fa * p.g}deg`
      el.style.scale = `${p.sx * p.s} ${p.s}`
    }
    // stacking during the shuffle goes through its own --sz, so React's --hz is never overwritten
    const z = (k: number, v: number) => els[k].style.setProperty('--sz', String(v))
    const tl = gsap.timeline({
      defaults: { overwrite: false },
      onComplete: () => {
        els.forEach((el) => {
          delete el.dataset.facedown
          el.style.translate = ''
          el.style.rotate = ''
          el.style.scale = ''
          el.style.removeProperty('--sz')
        })
        setShuffling(false)
      },
    })

    // 1. gather: the hand sweeps into one neat deck, each card turning face down on the way
    els.forEach((_, k) => {
      const at = (n - 1 - k) * 0.035 // right to left, like scooping up a spread
      tl.call(() => z(k, 30 + k), undefined, at)
      tl.to(st[k], { g: 1, s: S, duration: 0.55, ease: 'power3.inOut', onUpdate: () => draw(k) }, at)
      tl.to(st[k], { keyframes: { sx: [1, 0.02, 1] }, duration: 0.26, ease: 'none', onUpdate: () => draw(k) }, at + 0.12)
      tl.call(() => (els[k].dataset.facedown = '1'), undefined, at + 0.25)
    })
    // the deck is together: cards on the table rejoin the hand, out of sight in the pile
    tl.call(() => {
      flushSync(() => setOnTable([]))
      els.forEach((el, k) => {
        const c = centre(el)
        st[k].ox = deck.x - c.x
        st[k].oy = deck.y - c.y
        st[k].fa = parseFloat(el.style.getPropertyValue('--fa')) || 0
        draw(k)
      })
    })

    // 2. cut: the bottom half slides left, the top half right, both tipping in towards the middle
    const half = Math.ceil(n / 2)
    const cut = tl.duration() + 0.08
    els.forEach((_, k) => {
      const left = k < half
      const pos = left ? k : k - half
      tl.to(
        st[k],
        { dx: (left ? -1 : 1) * cw * 0.62, dy: -pos * thick, r: left ? 7 : -7, duration: 0.38, ease: 'power2.inOut', onUpdate: () => draw(k) },
        cut + (left ? 0 : 0.04),
      )
    })

    // 3. riffle: the halves bend in and drop their cards alternately onto one pile in the middle
    const order: number[] = []
    for (let p = 0; p < half; p++) {
      order.push(p) // left half
      if (half + p < n) order.push(half + p) // right half
    }
    const riffle = tl.duration() + 0.06
    tl.call(() => play('shuffle'), undefined, riffle)
    order.forEach((k, j) => {
      const at = riffle + j * 0.065
      tl.call(() => z(k, 60 + j), undefined, at)
      tl.to(
        st[k],
        {
          keyframes: { dy: [-(k < half ? k : k - half) * thick, -j * thick - 10, -j * thick], easeEach: 'sine.inOut' },
          dx: (j % 2 ? 1 : -1) * 2,
          r: (j % 2 ? -1 : 1) * 1.2,
          duration: 0.24,
          ease: 'power2.in',
          onUpdate: () => draw(k),
        },
        at,
      )
    })
    // a fresh hand while the deck is face down
    tl.call(() => setHand(dealHand()))

    // 4. square up: a quick tap that straightens the pile
    const square = tl.duration() + 0.05
    els.forEach((_, k) => tl.to(st[k], { dx: 0, r: 0, duration: 0.18, ease: 'power2.out', onUpdate: () => draw(k) }, square))
    tl.to({}, { duration: 0.12 })

    // 5. spread: the hand fans back out from the deck, left to right, each card turning face up
    const spread = tl.duration()
    els.forEach((_, k) => {
      const at = spread + k * 0.06
      tl.call(() => {
        z(k, 90 + n - k) // already in the hand's overlap order: About me on top
        play('draw')
      }, undefined, at)
      tl.to(st[k], { g: 0, s: 1, duration: 0.6, ease: 'power3.out', onUpdate: () => draw(k) }, at)
      tl.to(st[k], { keyframes: { sx: [1, 0.02, 1] }, duration: 0.26, ease: 'none', onUpdate: () => draw(k) }, at + 0.08)
      tl.call(() => delete els[k].dataset.facedown, undefined, at + 0.21)
    })
  }

  // Cards view: flip a card to its back (long press, or right-click on desktop).
  const flipCard = (i: number) => {
    const now = performance.now()
    if (view !== 'cards' || dealing !== -1 || now - lastFlip.current < 600) return
    lastFlip.current = now
    play('draw')
    setFlipping(i)
    // squash to the edge, swap faces and open straight back up — no hold at the edge
    window.setTimeout(() => {
      setFlipped((f) => (f.includes(i) ? f.filter((x) => x !== i) : [...f, i]))
      setFlipping(-1)
    }, 170)
  }

  // Grid edit mode: drag a tile (or the folder) to reorder; tap outside or Done to finish.
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
      const num = (v: string) => parseFloat(v) || 0
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

  const close = useCallback(() => setOpenIdx(-1), [])

  // Escape closes; ←/→ step through the tabs (→ from the stack opens the first one).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      // Option/Ctrl+Tab: browser-style tab switcher (Tab / Shift+Tab move, releasing the key opens)
      if (e.key === 'Tab' && (e.altKey || e.ctrlKey) && visible.length) {
        e.preventDefault()
        const pos = visible.indexOf(openIdx)
        const step = e.shiftKey ? -1 : 1
        setSwitcher((s) => (s === null ? (pos === -1 ? 0 : (pos + step + visible.length) % visible.length) : (s + step + visible.length) % visible.length))
        return
      }
      if (e.key === 'Escape') {
        if (switcher !== null) return setSwitcher(null)
        if (spot) return setSpot(false)
        if (editMode) return setEditMode(false)
        return openIdx === -1 && folderOpen ? setFolderOpen(false) : close()
      }
      const typing = e.target instanceof HTMLElement && !!e.target.closest('input, textarea, select')
      if (e.key === '/' && !typing && view === 'grid' && openIdx === -1) {
        e.preventDefault()
        setQuery('')
        return setSpot(true)
      }
      if ((e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') || e.metaKey || e.ctrlKey || e.altKey) return
      if (e.target instanceof HTMLElement && e.target.closest('input, textarea, select')) return
      const pos = visible.indexOf(openIdx)
      const nextPos = pos === -1 ? (e.key === 'ArrowRight' ? 0 : -1) : pos + (e.key === 'ArrowRight' ? 1 : -1)
      if (nextPos < 0 || nextPos >= visible.length) return
      e.preventDefault()
      setOpenIdx(visible[nextPos])
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [close, openIdx, visible, folderOpen, switcher, spot, editMode, view])

  useEffect(() => {
    if (switcher === null) return
    const onUp = (e: KeyboardEvent) => {
      if (e.key !== 'Alt' && e.key !== 'Control') return
      const i = visible[switcher]
      setSwitcher(null)
      if (i !== undefined) setOpenIdx(i)
    }
    window.addEventListener('keyup', onUp)
    return () => window.removeEventListener('keyup', onUp)
  }, [switcher, visible])

  // Every tab has its own address (/quick-label…). The History API changes the URL without
  // loading a new page, so nothing re-renders or replays — the animations run as before.
  // Keeps the title and history in sync, so shared links open the right tab and the
  // browser/phone back button closes it.
  useEffect(() => {
    const tab = TABS[openIdx]
    const want = tabPath(openIdx)
    document.title = tab ? `${tab.title} — ${PROFILE.name}` : `${PROFILE.name} — Portfolio`
    if (location.pathname !== want || location.hash) history.pushState(null, '', want + location.search)
    if (tab && typeof window.gtag === 'function') window.gtag('event', 'open_tab', { tab_name: tab.title })
  }, [openIdx])

  useEffect(() => {
    const onPop = () => {
      const idx = tabFromLocation()
      if (idx !== -1) setGone((g) => g.filter((x) => x !== idx))
      setOpenIdx(idx)
    }
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])

  // Closed tabs come back scrolled to the top.
  useEffect(() => {
    if (openIdx !== -1) return
    cardRefs.current.forEach((el) => el?.scrollTo({ top: 0 }))
  }, [openIdx])

  const pad = sidePad(vp)

  return (
    <main
      className={`stage stage--${view}${flying ? ' stage--flying' : ''}${landing ? ' stage--landing' : ''}${folderOpen ? ' stage--folder-open' : ''}${dealing !== -1 ? ' stage--dealing' : ''}${editMode ? ' stage--editing' : ''}${shuffling ? ' stage--shuffling' : ''}`}
      ref={stageRef}
    >
      {/* card table: behind everything, zoomed on its own when a card is dealt */}
      {view === 'cards' && <div className="table" aria-hidden />}
      <div className="header" style={{ left: pad, right: pad }} aria-hidden={openIdx > -1 || undefined}>
        <div className="header__id">
          <h1 className="header__name" aria-label={PROFILE.name}>
            {PROFILE.name.split(' ').map((word, w) => (
              <span key={w} className="word" aria-hidden>
                {word.split('').map((c, i) => (
                  <span key={i} className="ch-mask">
                    <span className="ch">{c}</span>
                  </span>
                ))}
              </span>
            ))}
          </h1>
          <div className="header__role">{PROFILE.role}</div>
        </div>
        <div className="header__meta">
          <nav className="header__socials" aria-label="Social links">
            {PROFILE.socials.map(([label, url]) => (
              <a key={label} href={url} target="_blank" rel="noreferrer">
                {label} ↗
              </a>
            ))}
          </nav>
          <div className="header__row">
            <div className="view-switch" role="group" aria-label="View">
              {VIEWS.map(([mode, icon, label]) => (
                <button
                  key={mode}
                  className={`view-switch__btn${view === mode ? ' is-on' : ''}`}
                  aria-pressed={view === mode}
                  onClick={() => toggleView(mode)}
                >
                  <span aria-hidden>{icon}</span>
                  {label}
                </button>
              ))}
            </div>
            {view === 'cards' && (
              <button className="shuffle" onClick={shuffle} disabled={dealing !== -1}>
                ♣<span className="shuffle__label"> Shuffle</span>
              </button>
            )}
            {view === 'cards' && (
              <button
                className="sound-toggle"
                aria-pressed={soundOn}
                aria-label={soundOn ? 'Mute card sounds' : 'Turn card sounds on'}
                onClick={() => {
                  setSoundOn(!soundOn)
                  setSoundState(!soundOn)
                }}
              >
                {soundOn ? '🔈' : '🔇'}
              </button>
            )}
            <span className="header__count">{n} tabs open</span>
            <a href={PROFILE.cv} download>
              CV ↓
            </a>
            <a href={`mailto:${PROFILE.email}`}>{PROFILE.email}</a>
          </div>
        </div>
      </div>

      <div className="stack" ref={stackRef}>
      {view === 'grid' && projectTabs.length > 0 && (() => {
        const geo = gridGeometry(vp, plainTabs.length, projectTabs.length, folderAt)
        const r = folderOpen ? geo.panel : geo.folder
        return (
          <>
            <div
              className={`folder-backdrop${folderOpen && openIdx === -1 ? ' is-open' : ''}`}
              style={{ zIndex: folderRaised ? 240 : -1 }}
              onClick={() => setFolderOpen(false)}
            />
            <div
              className={`folder${folderOpen ? ' is-open' : ''}${flying ? ' is-flying' : ''}${openIdx !== -1 ? ' is-hidden' : ''}`}
              style={{ top: r.top, left: r.left, width: r.width, height: r.height, zIndex: folderRaised ? 250 : 0 }}
              onClick={() => !folderOpen && !editMode && setFolderOpen(true)}
              onPointerDown={(e) => {
                if (folderOpen || editMode) return
                const t = window.setTimeout(() => setEditMode(true), 520)
                const stop = () => window.clearTimeout(t)
                e.currentTarget.addEventListener('pointerup', stop, { once: true })
                e.currentTarget.addEventListener('pointerleave', stop, { once: true })
              }}
              role={folderOpen ? 'dialog' : 'button'}
              aria-label={folderOpen ? 'Projects' : `Open Projects folder (${projectTabs.length})`}
              tabIndex={folderOpen ? -1 : 0}
              onKeyDown={(e) => {
                if (!folderOpen && (e.key === 'Enter' || e.key === ' ')) {
                  e.preventDefault()
                  setFolderOpen(true)
                }
              }}
            >
              <span className="folder__title">Projects</span>
              <span className="folder__badge" aria-hidden>
                {projectTabs.length}
              </span>
              <span className="card__chip folder__chip" aria-hidden>
                <i />
                Projects
                <em>{projectTabs.length}</em>
              </span>
            </div>
          </>
        )
      })()}
      {TABS.map((tab, i) => {
        const isGone = gone.includes(i)
        const self = openIdx === i
        const v = isGone ? n : stackPos(i)
        return (
          <TabCard
            key={tab.title}
            ref={(el) => {
              cardRefs.current[i] = el
            }}
            tab={tab}
            num={String(i + 1).padStart(2, '0')}
            style={cardStyle(vp, slotOf(i), view)}
            project={isProject(tab)}
            pip={view === 'cards' ? hand[i] : undefined}
            flingable={view === 'stack' && openIdx === -1 && !flying}
            onFling={() => setGone((g) => (g.includes(i) ? g : [...g, i]))}
            onLongPress={
              view === 'grid' && openIdx === -1 ? () => setEditMode(true) : view === 'cards' && openIdx === -1 ? () => flipCard(i) : undefined
            }
            flipped={view === 'cards' && flipped.includes(i)}
            flipping={flipping === i}
            isNew={view === 'grid' && !opened.includes(tab.title)}
            onTable={view === 'cards' && tableTabs.includes(i)}
            isOpen={self}
            animate={introDone && !flying && dealing !== i}
            hidden={isGone || (openIdx > -1 && !self)}
            back={view === 'stack' && !flying && openIdx === -1 && !isGone && v !== n - 1}
            peek={openIdx === -1 && lifted === i}
            onHover={(on) => setHoverIdx((h) => (on ? i : h === i ? -1 : h))}
            onOpen={(touch) => {
              if (openIdx !== -1 || editMode) return
              // phones, cards view: first tap lifts the card, a second tap on it deals it
              if (view === 'cards' && touch && picked !== i) return setPicked(i)
              // in the grid, a project inside the closed folder opens the folder first
              if (view === 'grid' && isProject(tab) && !folderOpen) setFolderOpen(true)
              else if (view === 'cards') {
                setPicked(-1)
                dealCard(i)
              }
              else setOpenIdx(i)
            }}
            onX={(e) => {
              e.stopPropagation()
              if (self) setOpenIdx(-1)
              else setGone((g) => (g.includes(i) ? g : [...g, i]))
            }}
            onNext={(e) => {
              e.stopPropagation()
              const next = visible[visible.indexOf(i) + 1]
              setOpenIdx(next === undefined ? -1 : next)
            }}
          />
        )
      })}
      </div>

      {/* stack: the surprise tab once every tab has been closed */}
      {view === 'stack' && n === 0 && openIdx === -1 && (
        <section className="incognito" style={{ left: pad, right: pad }} aria-label="Incognito tab">
          <div className="incognito__bar">
            <span>🕶</span>
            {INCOGNITO.title}
          </div>
          <div className="incognito__body">
            <h2>{INCOGNITO.heading}</h2>
            <p className="incognito__lead">{INCOGNITO.lead}</p>
            <ul className="incognito__facts">
              {INCOGNITO.facts.map(([icon, title, text]) => (
                <li key={title}>
                  <span className="incognito__icon" aria-hidden>
                    {icon}
                  </span>
                  <strong>{title}</strong>
                  <p>{text}</p>
                </li>
              ))}
            </ul>
            <p className="incognito__hint">{INCOGNITO.hint}</p>
          </div>
        </section>
      )}

      {/* Option/Ctrl+Tab switcher */}
      {switcher !== null && (
        <div className="switcher" role="listbox" aria-label="Switch tab">
          {visible.map((i, k) => (
            <div key={i} className={`switcher__item${k === switcher ? ' is-on' : ''}`} role="option" aria-selected={k === switcher}>
              <i style={{ background: TABS[i].bg }} />
              {TABS[i].title}
            </div>
          ))}
        </div>
      )}

      {/* grid: edit mode's Done pill, the dock and Spotlight */}
      {view === 'grid' && editMode && (
        <button className="edit-done" onClick={() => setEditMode(false)}>
          Done
        </button>
      )}
      {view === 'grid' && openIdx === -1 && !folderOpen && (
        <nav className="dock" aria-label="Links" ref={dockRef} onPointerMove={magnify} onPointerLeave={unmagnify}>
          <a className="dock__item dock__item--gh" href={PROFILE.socials[0][1]} target="_blank" rel="noreferrer" aria-label="GitHub">
            <span>GH</span>
          </a>
          <a className="dock__item dock__item--in" href={PROFILE.socials[1][1]} target="_blank" rel="noreferrer" aria-label="LinkedIn">
            <span>in</span>
          </a>
          <a className="dock__item dock__item--ig" href={PROFILE.socials[2][1]} target="_blank" rel="noreferrer" aria-label="Instagram">
            <span>IG</span>
          </a>
          <a className="dock__item dock__item--mail" href={`mailto:${PROFILE.email}`} aria-label="Email">
            <span>✉</span>
          </a>
          <a className="dock__item dock__item--cv" href={PROFILE.cv} download aria-label="Download CV">
            <span>CV</span>
          </a>
          <button
            className="dock__item dock__item--search"
            aria-label="Search"
            onClick={() => {
              setQuery('')
              setSpot(true)
            }}
          >
            <span>⌕</span>
          </button>
        </nav>
      )}
      {spot && (
        <div className="spot" onClick={() => setSpot(false)}>
          <div className="spot__panel" onClick={(e) => e.stopPropagation()}>
            <input
              autoFocus
              className="spot__input"
              placeholder="Search tabs, projects, skills…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  const hit = search(query)[0]
                  if (hit) {
                    setSpot(false)
                    setOpenIdx(hit.i)
                  }
                }
              }}
            />
            <ul className="spot__results">
              {search(query).map((h) => (
                <li key={h.i}>
                  <button
                    onClick={() => {
                      setSpot(false)
                      setOpenIdx(h.i)
                    }}
                  >
                    <i style={{ background: TABS[h.i].bg }} />
                    <strong>{h.title}</strong>
                    <span>{h.snippet}</span>
                  </button>
                </li>
              ))}
              {query.trim().length >= 2 && search(query).length === 0 && <li className="spot__empty">No results</li>}
            </ul>
          </div>
        </div>
      )}

      {/* cards: shuffle and the poker easter egg */}
      {toast && <div className="toast" role="status">{toast}</div>}

      {/* each tab address counts as its own page view in Vercel Analytics */}
      <Analytics route={tabPath(openIdx)} path={tabPath(openIdx)} />

      {gone.length > 0 && openIdx === -1 && (
        <button className="restore" onClick={() => setGone([])}>
          {gone.length} closed · undo
        </button>
      )}
    </main>
  )
}
