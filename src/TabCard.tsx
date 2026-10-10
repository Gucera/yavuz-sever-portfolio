import gsap from 'gsap'
import { forwardRef, memo, useCallback, useRef, type CSSProperties, type KeyboardEvent, type MouseEvent, type PointerEvent } from 'react'
import type { Tab } from './data'
import { EducationBody } from './Education'
import { AboutBody } from './About'
import { ExperienceBody } from './Experience'
import { CaseStudyBody } from './CaseStudy'
import { NisaBody } from './Nisa'
import { UkMapBody } from './UkMap'
import { DimarkBody } from './Dimark'
import { CandyBody } from './Candy'
import { CASE_STUDIES } from './data'
import { Icon } from './Icon'

type Props = {
  tab: Tab
  num: string
  style: CSSProperties
  isOpen: boolean
  animate: boolean
  hidden: boolean
  /** behind the front tab in the stack — only the tab bar reads */
  back: boolean
  /** hovered / touched in the stack — reveals the tab's content */
  peek: boolean
  /** a project case study (lives in the grid's folder) */
  project: boolean
  /** cards view: the playing card this tab was dealt as, e.g. { rank: 'K', suit: '♠' } */
  pip?: { rank: string; suit: string }
  /** stack view: drag sideways and let go fast to throw the tab away */
  flingable?: boolean
  onFling?: () => void
  /** press and hold ~0.5s (grid: edit mode, cards: flip) */
  onLongPress?: () => void
  /** cards view: showing the card back, and mid-flip (squashed) */
  flipped?: boolean
  flipping?: boolean
  /** grid view: never opened by this visitor yet */
  isNew?: boolean
  /** cards view: lying face up on the table */
  onTable?: boolean
  onHover: (on: boolean) => void
  /** touch is true when opened by a finger tap (the cards view uses tap-to-pick, tap-to-deal) */
  onOpen: (touch?: boolean) => void
  onX: (e: MouseEvent) => void
  onNext: (e: MouseEvent) => void
}

/** A finger is currently pressed on a tab card (shared so the peek can follow it across cards). */
let touchDown = false

export const TabCard = forwardRef<HTMLDivElement, Props>(function TabCard(
  { tab, num, style, isOpen, animate, hidden, back, peek, project, pip, flingable, onFling, onLongPress, flipped, flipping, isNew, onTable, onHover, onOpen, onX, onNext },
  ref,
) {
  const onKey = (e: KeyboardEvent) => {
    if (!isOpen && e.target === e.currentTarget && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault()
      onOpen()
    }
  }

  // Touch: the peek starts the moment a finger lands. Releasing pointer capture lets
  // pointerenter/leave follow the finger across the stack. Opening is decided on finger-up
  // (short press, barely moved) rather than by `click`, because the peek shifts the cards
  // under the finger and the browser would otherwise drop the click.
  const lastTouch = useRef(-Infinity)
  const elRef = useRef<HTMLDivElement | null>(null)
  const suppressClick = useRef(false) // a drag or long press just ended: ignore the click it makes

  // Long press (all pointers) and the stack's fling-to-close drag.
  const startGestures = (e: PointerEvent) => {
    const el = elRef.current
    if (!el || isOpen || e.button > 0 || (e.target as Element).closest('button')) return
    const { clientX: x0, clientY: y0, timeStamp: t0, pointerId } = e
    let dragging = false
    let last = { x: x0, t: t0 }
    let vx = 0
    const hold = onLongPress
      ? window.setTimeout(() => {
          suppressClick.current = true
          onLongPress()
        }, 520)
      : 0
    const move = (ev: globalThis.PointerEvent) => {
      if (ev.pointerId !== pointerId) return
      const dx = ev.clientX - x0
      const dy = ev.clientY - y0
      if (Math.hypot(dx, dy) > 8) window.clearTimeout(hold)
      if (!flingable) return
      if (!dragging && Math.abs(dx) > 12 && Math.abs(dx) > Math.abs(dy) * 1.2) dragging = true
      if (!dragging) return
      const dt = Math.max(1, ev.timeStamp - last.t)
      vx = (ev.clientX - last.x) / dt
      last = { x: ev.clientX, t: ev.timeStamp }
      el.style.translate = `${dx}px 0`
      el.style.rotate = `${dx / 24}deg`
    }
    const up = (ev: globalThis.PointerEvent) => {
      if (ev.pointerId !== pointerId) return
      window.clearTimeout(hold)
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', up)
      window.removeEventListener('pointercancel', up)
      if (!dragging) return
      suppressClick.current = true
      const dx = ev.clientX - x0
      const p = { x: dx, r: dx / 24 }
      const set = () => {
        el.style.translate = `${p.x}px 0`
        el.style.rotate = `${p.r}deg`
      }
      if (Math.abs(dx) > 140 || Math.abs(vx) > 0.6) {
        // thrown: keep going off-screen, spinning, then close the tab
        const dir = Math.sign(dx || vx)
        gsap.to(p, {
          x: dir * window.innerWidth * 1.1,
          r: dir * 40,
          duration: 0.45,
          ease: 'power2.in',
          onUpdate: set,
          onComplete: () => {
            // stay off-screen and invisible: the closed state sits on the other side, so the
            // card must not be seen travelling back across the stack
            el.style.visibility = 'hidden'
            onFling?.()
            window.setTimeout(() => {
              el.style.translate = ''
              el.style.rotate = ''
              el.style.visibility = ''
            }, 800)
          },
        })
      } else {
        gsap.to(p, { x: 0, r: 0, duration: 0.45, ease: 'back.out(2)', onUpdate: set, onComplete: () => {
          el.style.translate = ''
          el.style.rotate = ''
        } })
      }
    }
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', up)
    window.addEventListener('pointercancel', up)
  }

  const onPointerDown = (e: PointerEvent) => {
    suppressClick.current = false
    startGestures(e)
    if (e.pointerType === 'mouse' || isOpen) return
    // a finger on the × (or any button) must not start the peek: the peek shifts the cards,
    // the button slides out from under the finger and the tap is lost
    if ((e.target as Element).closest('button')) return
    touchDown = true
    lastTouch.current = e.timeStamp
    const el = e.target as Element
    if (el.hasPointerCapture?.(e.pointerId)) el.releasePointerCapture(e.pointerId)
    onHover(true)

    const { clientX: x0, clientY: y0, timeStamp: t0, pointerId } = e
    const finish = (ev: globalThis.PointerEvent) => {
      if (ev.pointerId !== pointerId) return
      window.removeEventListener('pointerup', finish)
      window.removeEventListener('pointercancel', finish)
      touchDown = false
      const tap = ev.type === 'pointerup' && ev.timeStamp - t0 < 450 && Math.hypot(ev.clientX - x0, ev.clientY - y0) < 14
      if (tap && !suppressClick.current) onOpen(true)
    }
    window.addEventListener('pointerup', finish)
    window.addEventListener('pointercancel', finish)
  }
  const onTap = (e: MouseEvent) => {
    if (suppressClick.current) {
      suppressClick.current = false
      return
    }
    if (e.timeStamp - lastTouch.current < 1000) return // touch: already handled on finger-up
    onOpen()
  }

  // the page content only depends on the tab and whether it's open, so hovering, picking or
  // shuffling cards doesn't re-render every page; onNext goes through a ref to stay stable
  const onNextRef = useRef(onNext)
  onNextRef.current = onNext
  const next = useCallback((e: MouseEvent) => onNextRef.current(e), [])

  return (
    <div
      ref={(node) => {
        elRef.current = node
        if (typeof ref === 'function') ref(node)
        else if (ref) ref.current = node
      }}
      className={`card${animate ? ' card--anim' : ''}${back ? ' card--back' : ''}${peek ? ' card--peek' : ''}${project ? ' card--project' : ''}${flipped ? ' card--flipped' : ''}${flipping ? ' card--flipping' : ''}${onTable ? ' card--table' : ''}`}
      style={style}
      onClick={isOpen ? undefined : onTap}
      onPointerDown={onPointerDown}
      onPointerEnter={(e) => {
        // touch fires pointerenter as the finger lands (before pointerdown); only follow a finger
        // that is already pressing and sliding across the stack
        if (e.pointerType === 'mouse' || touchDown) onHover(true)
      }}
      onPointerLeave={() => onHover(false)}
      onPointerCancel={() => onHover(false)}
      onContextMenu={(e) => {
        if (isOpen) return
        e.preventDefault()
        // right-click works like a long press on desktop (flips a card in the cards view)
        if (e.nativeEvent instanceof globalThis.PointerEvent && e.nativeEvent.pointerType !== 'mouse') return
        onLongPress?.()
      }}
      onKeyDown={onKey}
      // a closed card is never scrolled (focus or find-in-page could otherwise leave its
      // thumbnail, label and corner index shifted)
      onScroll={(e) => {
        if (!isOpen && e.currentTarget.scrollTop) e.currentTarget.scrollTop = 0
      }}
      role={isOpen ? 'dialog' : 'button'}
      aria-modal={isOpen || undefined}
      aria-label={isOpen ? tab.title : `Open ${tab.title}`}
      aria-hidden={hidden || undefined}
      tabIndex={hidden ? -1 : 0}
    >
      {/* full-size label for the grid view, where the page itself is a small thumbnail */}
      {/* cards view: the bottom-right index; the top-left one sits in the tab bar below */}
      {pip && (
        <span className={`card__pip card__pip--br${pip.suit === '♥' || pip.suit === '♦' ? ' is-red' : ''}`} aria-hidden>
          {pip.rank}
          <i>{pip.suit}</i>
        </span>
      )}
      <span className="card__chip" aria-hidden>
        {pip ? (
          <b className={`card__chip-pip${pip.suit === '♥' || pip.suit === '♦' ? ' is-red' : ''}`}>
            {pip.rank}
            {pip.suit}
          </b>
        ) : (
          <i style={{ background: tab.bg }} />
        )}
        {tab.title}
        {isNew && <span className="card__new" aria-label="new" />}
        <em>{num}</em>
      </span>
      {pip && (
        <div className="card__back" aria-hidden={!flipped}>
          <span className="card__back-mono">YSS</span>
          <strong>{tab.title}</strong>
          <span className="card__back-kind">
            {tab.kind} · {tab.year}
          </span>
          <p>{tab.description.split(/(?<=\.)\s/)[0].slice(0, 150)}</p>
          <span className="card__back-hint">tap to deal</span>
        </div>
      )}
      <article className="card__page" style={{ background: tab.bg, color: tab.ink }} inert={!isOpen}>
        <div className="card__bar">
          <button
            className="card__x"
            onClick={onX}
            tabIndex={hidden ? -1 : 0}
            aria-label={isOpen ? `Close ${tab.title}` : `Dismiss ${tab.title}`}
          >
            <Icon name="close" size={13} />
          </button>
          <span className="card__tab">
            <i style={{ background: tab.bg }} />
            {tab.title}
          </span>
          <span className="card__url">https://{tab.url}</span>
          <span className="card__num">{num}</span>
        </div>

        <CardContent tab={tab} isOpen={isOpen} onNext={next} />
      </article>
    </div>
  )
})

const CardContent = memo(function CardContent({ tab, isOpen, onNext }: { tab: Tab; isOpen: boolean; onNext: (e: MouseEvent) => void }) {
  const meta = (
    <dl className="card__meta" data-reveal>
      {tab.meta.map(([label, value]) => (
        <div key={label} style={{ display: 'contents' }}>
          <dt>{label}</dt>
          <dd>{value}</dd>
        </div>
      ))}
    </dl>
  )
  const next = (
    <button className="card__next" onClick={onNext} tabIndex={isOpen ? 0 : -1} data-reveal>
      next tab <Icon name="arrowRight" size={14} />
    </button>
  )
  return (
    <>
      <header className="card__head">
        <h2 className="card__title" data-reveal>
          {tab.title}
        </h2>
        <div className="card__tags" data-reveal>
          <span>{tab.kind}</span>
          <span>{tab.year}</span>
        </div>
      </header>

      {tab.extra === 'about' ? (
        <AboutBody tab={tab} meta={meta} next={next} />
      ) : tab.extra === 'education' ? (
        <EducationBody tab={tab} active={isOpen} meta={meta} next={next} />
      ) : tab.extra === 'experience' ? (
        <ExperienceBody tab={tab} meta={meta} next={next} />
      ) : tab.extra === 'candy' ? (
        <CandyBody tab={tab} active={isOpen} meta={meta} next={next} />
      ) : tab.extra === 'dimark' ? (
        <DimarkBody tab={tab} active={isOpen} meta={meta} next={next} />
      ) : tab.extra === 'nisa' ? (
        <NisaBody tab={tab} active={isOpen} meta={meta} next={next} />
      ) : tab.extra === 'map' ? (
        <UkMapBody tab={tab} active={isOpen} meta={meta} next={next} />
      ) : tab.extra === 'case' && CASE_STUDIES[tab.title] ? (
        <CaseStudyBody tab={tab} study={CASE_STUDIES[tab.title]} active={isOpen} meta={meta} next={next} />
      ) : (
        <div className="card__body">
          <div className="card__text">
            <p className="card__lead" data-reveal>
              {tab.description}
            </p>
            {meta}
            {next}
          </div>

          <div className="card__media">
            <div className="media media--hero" data-reveal>
              {tab.media[0]}
            </div>
            <div className="media__row" data-reveal>
              <div className="media media--detail">{tab.media[1]}</div>
              <div className="media media--detail">{tab.media[2]}</div>
            </div>
          </div>
        </div>
      )}
    </>
  )
})
