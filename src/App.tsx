import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import type React from 'react'
import { flushSync } from 'react-dom'
import gsap from 'gsap'
import { Analytics } from '@vercel/analytics/react'
import { PROFILE, TABS, isProject } from './data'
import { cardStyle, gridGeometry, sidePad, type ViewMode, type Viewport } from './layout'
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
  const hoverV = openIdx === -1 && hoverIdx !== -1 && !gone.includes(hoverIdx) ? stackPos(hoverIdx) : -1
  const plainTabs = visible.filter((i) => !isProject(TABS[i]))
  const projectTabs = visible.filter((i) => isProject(TABS[i]))
  const slotOf = (i: number) => {
    const isGone = gone.includes(i)
    const project = isProject(TABS[i])
    const grid = {
      r: Math.max(0, project ? projectTabs.indexOf(i) : plainTabs.indexOf(i)),
      nTabs: plainTabs.length,
      nProjects: projectTabs.length,
      project,
      folderOpen,
      raised: folderRaised,
    }
    return { v: isGone ? n : stackPos(i), n, openV, hoverV, self: openIdx === i, gone: isGone, grid }
  }

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
    if (next === 'cards') setHand(dealHand()) // a fresh, random hand every time
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
    const from = { top: num(el.style.top), left: num(el.style.left), width: num(el.style.width), height: num(el.style.height) }
    const pt = num(getComputedStyle(el).getPropertyValue('--pt'))
    const st = { fa: num(el.style.getPropertyValue('--fa')), lift: 0, rx: 0, s: 1 }
    const apply = () => {
      el.style.transform = `perspective(1600px) rotate(${st.fa}deg) translateY(${st.lift}px) rotateX(${st.rx}deg) scale(${st.s})`
    }
    // where the card lands on the table: centred and a touch smaller (the table is further away)
    const tw = from.width * 0.92
    const th = from.height * 0.92
    const table = { top: vp.h * (vp.mobile ? 0.5 : 0.52) - th / 2, left: vp.w / 2 - tw / 2, width: tw, height: th }
    const placed = (i % 2 ? 1 : -1) * 4 // left slightly askew, as if dropped by hand

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
        delete el.dataset.dealt
        delete el.dataset.camera
        gsap.set(page, { clearProps: 'transform,width,minHeight' })
        gsap.set(el, { clearProps: 'transformOrigin' })
      },
    })
    // 1. straight from the hand onto the table: a short arc while it tips back and lies down
    tl.to(el, { ...table, duration: 0.8, ease: 'power3.out' })
    tl.to(page, { scale: table.width / vp.w, duration: 0.8, ease: 'power3.out' }, '<') // thumbnail follows the card's size
    tl.to(
      st,
      {
        keyframes: { lift: [0, -from.height * 0.18, 0], fa: [st.fa, st.fa / 2, placed], rx: [0, 30, 55], easeEach: 'sine.inOut' },
        duration: 0.8,
        ease: 'power3.out',
        onUpdate: apply,
      },
      '<',
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
    }, undefined, '+=0.12')
    tl.to(cam, { ...target, duration: 1.1, ease: 'power3.inOut', onUpdate: shoot }, '<')
    tl.to(st, { rx: 0, fa: 0, duration: 1.1, ease: 'power3.inOut', onUpdate: apply }, '<')
    tl.to(el, { borderRadius: 0, duration: 1.1, ease: 'power3.inOut' }, '<')
    // the thumbnail sat under the card's tab bar; the open page starts at the very top
    tl.to(page, { y: 0, duration: 1.1, ease: 'power3.inOut' }, '<')
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

  const close = useCallback(() => setOpenIdx(-1), [])

  // Escape closes; ←/→ step through the tabs (→ from the stack opens the first one).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') return openIdx === -1 && folderOpen ? setFolderOpen(false) : close()
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
  }, [close, openIdx, visible, folderOpen])

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
      className={`stage stage--${view}${flying ? ' stage--flying' : ''}${landing ? ' stage--landing' : ''}${folderOpen ? ' stage--folder-open' : ''}${dealing !== -1 ? ' stage--dealing' : ''}`}
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
        const geo = gridGeometry(vp, plainTabs.length, projectTabs.length)
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
              onClick={() => !folderOpen && setFolderOpen(true)}
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
            isOpen={self}
            animate={introDone && !flying && dealing === -1}
            hidden={isGone || (openIdx > -1 && !self)}
            back={view === 'stack' && !flying && openIdx === -1 && !isGone && v !== n - 1}
            peek={openIdx === -1 && hoverIdx === i}
            onHover={(on) => setHoverIdx((h) => (on ? i : h === i ? -1 : h))}
            onOpen={() => {
              if (openIdx !== -1) return
              // in the grid, a project inside the closed folder opens the folder first
              if (view === 'grid' && isProject(tab) && !folderOpen) setFolderOpen(true)
              else if (view === 'cards') dealCard(i)
              else setOpenIdx(i)
            }}
            onX={(e) => {
              e.stopPropagation()
              if (self) setOpenIdx(-1)
              else setGone((g) => [...g, i])
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
