import { useLayoutEffect, type CSSProperties, type MutableRefObject } from 'react'
import gsap from 'gsap'
import { cardStyle, type Slot, type ViewMode, type Viewport } from '../layout'

type Args = {
  view: ViewMode
  vp: Viewport
  visible: number[]
  stackPos: (i: number) => number
  slotOf: (i: number) => Slot
  cardRefs: MutableRefObject<(HTMLDivElement | null)[]>
  /** each card's style just before the view changed; set by the view switch, consumed here */
  flightFrom: MutableRefObject<CSSProperties[] | null>
  /** back-of-stack content faded out during a flight into the stack */
  fadingRef: MutableRefObject<Element[]>
  onLand: () => void
}

const DURATION = 1.15
const STAGGER = 0.07
// GSAP's power2.inOut, for the Web Animations below
const EASE = 'cubic-bezier(0.45, 0, 0.55, 1)'

const num = (v: unknown) => Number(v) || 0
const prop = (s: CSSProperties, k: string) => (s as Record<string, unknown>)[k]

/**
 * Switching views: every card flies along an arc from where it was to its new place.
 *
 * The card's box (position and size) is tweened by GSAP: with layout containment that's a
 * cheap re-layout of one small box. The page inside — the expensive part — is moved and
 * scaled with the Web Animations API, which runs on the compositor: the page is never
 * repainted mid-flight, and the browser rasterises it at the largest scale it will reach, so
 * it stays sharp while growing.
 */
export function useViewFlight({ view, vp, visible, stackPos, slotOf, cardRefs, flightFrom, fadingRef, onLand }: Args) {
  useLayoutEffect(() => {
    const from = flightFrom.current
    if (!from) return
    flightFrom.current = null
    const n = visible.length
    // back of the stack lifts off first; each card swings up and to the side, tilting as it flies
    const order = visible.slice().reverse()
    const pageAnims: Animation[] = []
    const root = document.documentElement
    root.dataset.flying = '1' // lets heavy loops (the 3D crest) pause mid-flight
    const land = () => {
      pageAnims.forEach((a) => a.cancel()) // CSS (--ps/--pt) already holds the final page transform
      requestAnimationFrame(() => {
        delete root.dataset.flying
        onLand()
      })
    }
    const tl = gsap.timeline({ onComplete: land })
    // Flying back into the stack: the tabs that end up behind the front one only show their
    // bar there, so their content fades out during the flight — no pop on landing.
    const fading: Element[] = (fadingRef.current =
      view === 'stack'
        ? visible
            .filter((i) => stackPos(i) !== n - 1)
            .flatMap((i) => [...(cardRefs.current[i]?.querySelectorAll('.card__page > :not(.card__bar)') ?? [])])
        : [])
    if (fading.length) tl.fromTo(fading, { opacity: 1 }, { opacity: 0.002, duration: 0.9, ease: 'power1.inOut' }, 0.3)

    order.forEach((i, k) => {
      const el = cardRefs.current[i]
      if (!el) return
      const f = from[i]
      const t = cardStyle(vp, { ...slotOf(i), hoverV: -1 }, view)
      const [ft, fl, fw, fh] = [num(f.top), num(f.left), num(f.width), num(f.height)]
      const [tt, tlft, tw, th] = [num(t.top), num(t.left), num(t.width), num(t.height)]
      const lift = 90 + k * 22
      const swing = (vp.mobile ? 60 : 160) * (view === 'grid' ? 1 : -1)
      const tilt = (k % 2 ? 1 : -1) * (5 + k * 1.5)
      const fs = Number(prop(f, '--ps') ?? 1)
      const ts = Number(prop(t, '--ps') ?? 1)
      const fy = parseFloat(String(prop(f, '--pt') ?? 0)) || 0
      const ty = parseFloat(String(prop(t, '--pt') ?? 0)) || 0
      const fa = parseFloat(String(prop(f, '--fa') ?? 0)) || 0
      const ta = parseFloat(String(prop(t, '--fa') ?? 0)) || 0

      const page = el.querySelector<HTMLElement>('.card__page')
      if (page) {
        // pin the page's height for the flight, so its content is never re-laid-out
        page.style.minHeight = `${Math.max(fh / fs, th / ts)}px`
        const a = page.animate(
          [
            { transform: `translateY(${fy}px) scale(${fs})` },
            { transform: `translateY(${(fy + ty) / 2}px) scale(${(fs + ts) / 2})` },
            { transform: `translateY(${ty}px) scale(${ts})` },
          ],
          { duration: DURATION * 1000, delay: k * STAGGER * 1000, easing: EASE, fill: 'both' },
        )
        const unpin = () => (page.style.minHeight = '')
        a.finished.then(unpin, unpin)
        pageAnims.push(a)
      }

      gsap.set(el, { top: ft, left: fl, width: fw, height: fh, '--fr': '0deg', '--fa': `${fa}deg` })
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
          duration: DURATION,
          ease: 'power2.inOut',
        },
        k * STAGGER,
      )
    })
    return () => {
      tl.kill()
      pageAnims.forEach((a) => a.cancel())
      delete root.dataset.flying
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view])
}
