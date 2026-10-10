import { useCallback, useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from 'react'
import gsap from 'gsap'
import { Analytics } from '@vercel/analytics/react'
import { PROFILE, TABS, isProject } from './data'
import { bestHand } from './poker'
import { areaTop, cardStyle, gridGeometry, sidePad, type ViewMode } from './layout'
import { TabCard } from './TabCard'
import { Terminal } from './Terminal'
import { FOLDER_KEY, dealHand, readList, readView, reducedMotion, tabFromLocation, tabPath, writeList, writeStr } from './app/util'
import { useViewport } from './hooks/useViewport'
import { useTheme } from './hooks/useTheme'
import { useEmailCopy } from './hooks/useEmailCopy'
import { useStackTilt } from './hooks/useStackTilt'
import { useViewFlight } from './hooks/useViewFlight'
import { useDeal } from './hooks/useDeal'
import { useShuffle } from './hooks/useShuffle'
import { useGridEdit } from './hooks/useGridEdit'
import { Header } from './components/Header'
import { Dock } from './components/Dock'
import { Spotlight } from './components/Spotlight'
import { Toasts } from './components/Toasts'
import { Incognito } from './components/Incognito'
import { Folder } from './components/Folder'

export default function App() {
  const vp = useViewport()
  const { theme, themeNow, setTheme } = useTheme()
  const { copyEmail, mailNote, closeMailNote } = useEmailCopy()

  const [openIdx, setOpenIdx] = useState(tabFromLocation)
  const [gone, setGone] = useState<number[]>([])
  const [introDone, setIntroDone] = useState(false)
  const [hoverIdx, setHoverIdx] = useState(-1)
  // the Stack is the home view; the visitor's last choice is remembered
  const [view, setView] = useState<ViewMode>(readView)
  const [flying, setFlying] = useState(false)
  const [landing, setLanding] = useState(false)
  // grid: the projects live in an iOS-style folder; edit mode reorders tiles (saved)
  const [folderOpen, setFolderOpen] = useState(false)
  const [folderRaised, setFolderRaised] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [gridOrder, setGridOrder] = useState(() => readList('grid-order'))
  const [opened, setOpened] = useState(() => readList('opened-tabs'))
  const [spot, setSpot] = useState(false)
  // cards: the hand, the card picked on touch screens, flipped cards, cards left on the table
  const [hand, setHand] = useState(dealHand)
  const [picked, setPicked] = useState(-1)
  const [flipped, setFlipped] = useState<number[]>([])
  const [flipping, setFlipping] = useState(-1)
  const [onTable, setOnTable] = useState<number[]>([])
  const [toast, setToast] = useState<string | null>(null)

  const lastFlip = useRef(0)
  const skipReveal = useRef(false) // a dealt card opens in place: don't replay the content reveal
  const flightFrom = useRef<CSSProperties[] | null>(null)
  const fadingRef = useRef<Element[]>([])
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

  const { dealing, dealCard, lastDealt } = useDeal({
    vp,
    flying,
    slotOf,
    tableTabs,
    cardRefs,
    stageRef,
    skipReveal,
    setOpenIdx,
    setOnTable,
    setFlipped,
    setHoverIdx,
  })
  const { shuffling, shuffle } = useShuffle({ vp, visible, dealing, cardRefs, setPicked, setHoverIdx, setOnTable, setFlipped, setHand })
  useStackTilt(stackRef, openIdx, dealing)
  useGridEdit({ editMode, setEditMode, view, openIdx, vp, stageRef, cardRefs, plainTabs, projectTabs, orderRef, setGridOrder })
  useViewFlight({
    view,
    vp,
    visible,
    stackPos,
    slotOf,
    cardRefs,
    flightFrom,
    fadingRef,
    onLand: () => {
      setLanding(true)
      setFlying(false)
      window.setTimeout(() => setLanding(false), 450)
    },
  })

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

  // Switch views: remember where every card is now, then useViewFlight flies each one along
  // an arc to its new place (the terminal hides the cards, so it simply fades).
  const toggleView = (next: ViewMode) => {
    if (openIdx !== -1 || flying || dealing !== -1 || next === view) return
    if (folderOpen) setFolderOpen(false)
    setEditMode(false)
    setOnTable([])
    setFlipped([])
    if (next === 'cards') setHand(dealHand()) // a fresh, random hand every time
    if (!reducedMotion() && next !== 'terminal' && view !== 'terminal') {
      flightFrom.current = TABS.map((_, i) => cardStyle(vp, { ...slotOf(i), hoverV: -1 }, view))
      setFlying(true)
    }
    setHoverIdx(-1)
    setView(next)
    writeStr('view', next === 'stack' ? null : next)
  }

  // Intro: header letters rise, then the tabs slide up into place.
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

  // Tabs behind the front one keep their content hidden, so the browser never decodes their
  // images until a flight reveals them mid-air. Decode them while idle.
  useEffect(() => {
    if (!introDone) return
    const warm = () => cardRefs.current.forEach((el) => el?.querySelectorAll('img').forEach((img) => img.decode?.().catch(() => {})))
    const idle = window.requestIdleCallback ?? ((cb: () => void) => window.setTimeout(cb, 300))
    idle(warm)
  }, [introDone])

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
  }, [openIdx, view, lastDealt])

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

  // Cards view: flip a card to its back (long press, or right-click on desktop).
  const flipCard = (i: number) => {
    const now = performance.now()
    if (view !== 'cards' || dealing !== -1 || now - lastFlip.current < 600) return
    lastFlip.current = now
    setFlipping(i)
    // squash to the edge, swap faces and open straight back up — no hold at the edge
    window.setTimeout(() => {
      setFlipped((f) => (f.includes(i) ? f.filter((x) => x !== i) : [...f, i]))
      setFlipping(-1)
    }, 170)
  }

  const close = useCallback(() => setOpenIdx(-1), [])

  // Escape closes whatever is on top. There are no other keyboard shortcuts.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      if (spot) return setSpot(false)
      if (editMode) return setEditMode(false)
      return openIdx === -1 && folderOpen ? setFolderOpen(false) : close()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [close, openIdx, folderOpen, spot, editMode])

  // Every tab has its own address (/quick-label…). The History API changes the URL without
  // loading a new page, so nothing re-renders or replays. Shared links open the right tab and
  // the browser/phone back button closes it.
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
  const openSearch = () => setSpot(true)
  const openTab = (i: number) => {
    setGone((g) => g.filter((x) => x !== i))
    setOpenIdx(i)
  }
  const stageClass = [
    'stage',
    `stage--${view}`,
    flying && 'stage--flying',
    landing && 'stage--landing',
    folderOpen && 'stage--folder-open',
    dealing !== -1 && 'stage--dealing',
    editMode && 'stage--editing',
    shuffling && 'stage--shuffling',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <main className={stageClass} ref={stageRef}>
      {/* card table: behind everything, zoomed on its own when a card is dealt */}
      {view === 'cards' && <div className="table" aria-hidden />}
      <Header
        style={{ left: pad, right: pad }}
        hidden={openIdx > -1}
        view={view}
        onView={toggleView}
        ready={introDone}
        shuffle={view === 'cards' ? { run: shuffle, disabled: dealing !== -1 } : undefined}
        onSearch={openSearch}
        themeNow={themeNow}
        themeTitle={theme === 'auto' ? 'Theme follows the time of day' : `${theme} theme`}
        onToggleTheme={() => setTheme(themeNow === 'day' ? 'night' : 'day')}
        tabCount={n}
        onHire={copyEmail}
      />

      <div className="stack" ref={stackRef}>
        {view === 'grid' && projectTabs.length > 0 && (
          <Folder
            rect={(() => {
              const geo = gridGeometry(vp, plainTabs.length, projectTabs.length, folderAt)
              return folderOpen ? geo.panel : geo.folder
            })()}
            open={folderOpen}
            raised={folderRaised}
            flying={flying}
            tabOpen={openIdx !== -1}
            count={projectTabs.length}
            editMode={editMode}
            onOpen={() => setFolderOpen(true)}
            onClose={() => setFolderOpen(false)}
            onEdit={() => setEditMode(true)}
          />
        )}
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
              onLongPress={view === 'grid' && openIdx === -1 ? () => setEditMode(true) : view === 'cards' && openIdx === -1 ? () => flipCard(i) : undefined}
              flipped={view === 'cards' && flipped.includes(i)}
              flipping={flipping === i}
              isNew={view === 'grid' && !opened.includes(tab.title)}
              onTable={view === 'cards' && tableTabs.includes(i)}
              isOpen={self}
              full={self || dealing === i}
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
                } else setOpenIdx(i)
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

      {view === 'stack' && n === 0 && openIdx === -1 && (
        <Incognito style={{ left: pad, right: pad, top: areaTop(vp), maxHeight: vp.h - areaTop(vp) - (vp.mobile ? 86 : 80) }} />
      )}

      {view === 'terminal' && (
        <div className="term-wrap" style={{ left: pad, right: pad, top: areaTop(vp) }}>
          <Terminal onOpen={openTab} onView={toggleView} onTheme={setTheme} onSearch={openSearch} onCopyEmail={copyEmail} />
        </div>
      )}

      {view === 'grid' && editMode && (
        <button className="edit-done" onClick={() => setEditMode(false)}>
          Done
        </button>
      )}
      {view === 'grid' && openIdx === -1 && !folderOpen && <Dock onSearch={openSearch} onEmail={copyEmail} />}
      {spot && <Spotlight onClose={() => setSpot(false)} onOpen={openTab} />}

      <Toasts toast={toast} mailNote={mailNote} onCloseMail={closeMailNote} />

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
