import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { PROFILE, TABS } from './data'
import { cardStyle, sidePad, type Viewport } from './layout'
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

const clamp1 = (v: number) => Math.max(-1, Math.min(1, v))

type OrientationPermission = { requestPermission?: () => Promise<'granted' | 'denied'> }
let tiltGranted = false

/**
 * Calls `onTilt` with x/y in -1…1 as the phone tilts, relative to how it's being held
 * (the neutral pose slowly re-centres). iOS needs permission from a user gesture, so the
 * first touch asks for it. Returns a cleanup function.
 */
function listenToDeviceTilt(onTilt: (x: number, y: number) => void) {
  let base: { x: number; y: number } | null = null
  const onOrient = (e: DeviceOrientationEvent) => {
    if (e.gamma == null || e.beta == null) return
    const angle = screen.orientation?.angle ?? 0
    let x = e.gamma
    let y = e.beta
    if (angle === 90) [x, y] = [e.beta, -e.gamma]
    else if (angle === 270 || angle === -90) [x, y] = [-e.beta, e.gamma]
    else if (angle === 180) [x, y] = [-e.gamma, -e.beta]
    base ??= { x, y }
    base.x += (x - base.x) * 0.02
    base.y += (y - base.y) * 0.02
    onTilt(clamp1((x - base.x) / 25), clamp1((y - base.y) / 25))
  }
  const listen = () => window.addEventListener('deviceorientation', onOrient)
  const DOE = window.DeviceOrientationEvent as unknown as OrientationPermission | undefined
  let ask: (() => void) | undefined

  if (!DOE) return () => {}
  if (typeof DOE.requestPermission !== 'function' || tiltGranted) listen()
  else {
    ask = () => {
      DOE.requestPermission!()
        .then((state) => {
          if (state !== 'granted') return
          tiltGranted = true
          listen()
        })
        .catch(() => {})
    }
    window.addEventListener('pointerup', ask, { once: true })
  }
  return () => {
    window.removeEventListener('deviceorientation', onOrient)
    if (ask) window.removeEventListener('pointerup', ask)
  }
}

const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

export default function App() {
  const vp = useViewport()
  const [openIdx, setOpenIdx] = useState(-1)
  const [gone, setGone] = useState<number[]>([])
  const [introDone, setIntroDone] = useState(false)
  const [hoverIdx, setHoverIdx] = useState(-1)

  const stageRef = useRef<HTMLElement>(null)
  const stackRef = useRef<HTMLDivElement>(null)
  const cardRefs = useRef<(HTMLDivElement | null)[]>([])

  const visible = TABS.map((_, i) => i).filter((i) => !gone.includes(i))
  const n = visible.length
  // TABS is in reading order; the first tab sits at the front of the stack.
  const stackPos = (i: number) => n - 1 - visible.indexOf(i)
  const openV = openIdx === -1 ? -1 : stackPos(openIdx)
  const hoverV = openIdx === -1 && hoverIdx !== -1 && !gone.includes(hoverIdx) ? stackPos(hoverIdx) : -1

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
    if (reducedMotion()) return
    const ctx = gsap.context(() => {
      gsap.from('[data-reveal]', { y: 36, opacity: 0, duration: 0.7, ease: 'power3.out', stagger: 0.06, delay: 0.3 })
    }, el)
    return () => ctx.revert()
  }, [openIdx])

  // Subtle 3D tilt of the whole stack: follows the mouse on desktop, the phone's tilt on touch devices.
  useEffect(() => {
    const stack = stackRef.current
    if (!stack || reducedMotion()) return
    gsap.set(stack, { transformPerspective: 1800, transformOrigin: '50% 30%' })
    if (openIdx !== -1) {
      gsap.to(stack, { rotationX: 0, rotationY: 0, duration: 0.6, ease: 'power3.out' })
      return
    }
    const rx = gsap.quickTo(stack, 'rotationX', { duration: 0.9, ease: 'power3.out' })
    const ry = gsap.quickTo(stack, 'rotationY', { duration: 0.9, ease: 'power3.out' })

    if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
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
    }

    return listenToDeviceTilt((x, y) => {
      ry(x * 6)
      rx(-y * 4)
    })
  }, [openIdx])

  const close = useCallback(() => setOpenIdx(-1), [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [close])

  // Closed tabs come back scrolled to the top.
  useEffect(() => {
    if (openIdx !== -1) return
    cardRefs.current.forEach((el) => el?.scrollTo({ top: 0 }))
  }, [openIdx])

  const pad = sidePad(vp)

  return (
    <main className="stage" ref={stageRef}>
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
            <span>{n} tabs open</span>
          <a href={`mailto:${PROFILE.email}`}>{PROFILE.email}</a>
          </div>
        </div>
      </div>

      <div className="stack" ref={stackRef}>
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
            style={cardStyle(vp, { v, n, openV, hoverV, self, gone: isGone })}
            isOpen={self}
            animate={introDone}
            hidden={isGone || (openIdx > -1 && !self)}
            back={openIdx === -1 && !isGone && v !== n - 1}
            peek={openIdx === -1 && hoverIdx === i}
            onHover={(on) => setHoverIdx((h) => (on ? i : h === i ? -1 : h))}
            onOpen={() => {
              if (openIdx === -1) setOpenIdx(i)
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

      {gone.length > 0 && openIdx === -1 && (
        <button className="restore" onClick={() => setGone([])}>
          {gone.length} closed · undo
        </button>
      )}
    </main>
  )
}
