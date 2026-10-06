import { forwardRef, useRef, type CSSProperties, type KeyboardEvent, type MouseEvent, type PointerEvent } from 'react'
import type { Tab } from './data'
import { EducationBody } from './Education'
import { AboutBody } from './About'
import { ExperienceBody } from './Experience'
import { CaseStudyBody } from './CaseStudy'
import { NisaBody } from './Nisa'
import { DimarkBody } from './Dimark'
import { CandyBody } from './Candy'
import { CASE_STUDIES } from './data'

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
  onHover: (on: boolean) => void
  onOpen: () => void
  onX: (e: MouseEvent) => void
  onNext: (e: MouseEvent) => void
}

export const TabCard = forwardRef<HTMLDivElement, Props>(function TabCard(
  { tab, num, style, isOpen, animate, hidden, back, peek, onHover, onOpen, onX, onNext },
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
  const onPointerDown = (e: PointerEvent) => {
    if (e.pointerType === 'mouse' || isOpen) return
    lastTouch.current = e.timeStamp
    const el = e.target as Element
    if (el.hasPointerCapture?.(e.pointerId)) el.releasePointerCapture(e.pointerId)
    onHover(true)

    const { clientX: x0, clientY: y0, timeStamp: t0, pointerId } = e
    const finish = (ev: globalThis.PointerEvent) => {
      if (ev.pointerId !== pointerId) return
      window.removeEventListener('pointerup', finish)
      window.removeEventListener('pointercancel', finish)
      const tap = ev.type === 'pointerup' && ev.timeStamp - t0 < 450 && Math.hypot(ev.clientX - x0, ev.clientY - y0) < 14
      if (tap) onOpen()
    }
    window.addEventListener('pointerup', finish)
    window.addEventListener('pointercancel', finish)
  }
  const onTap = (e: MouseEvent) => {
    if (e.timeStamp - lastTouch.current < 1000) return // touch: already handled on finger-up
    onOpen()
  }

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
      next tab →
    </button>
  )

  return (
    <div
      ref={ref}
      className={`card${animate ? ' card--anim' : ''}${back ? ' card--back' : ''}${peek ? ' card--peek' : ''}`}
      style={style}
      onClick={isOpen ? undefined : onTap}
      onPointerDown={onPointerDown}
      onPointerEnter={() => onHover(true)}
      onPointerLeave={() => onHover(false)}
      onPointerCancel={() => onHover(false)}
      onContextMenu={(e) => !isOpen && e.preventDefault()}
      onKeyDown={onKey}
      role={isOpen ? 'dialog' : 'button'}
      aria-modal={isOpen || undefined}
      aria-label={isOpen ? tab.title : `Open ${tab.title}`}
      aria-hidden={hidden || undefined}
      tabIndex={hidden ? -1 : 0}
    >
      <article className="card__page" style={{ background: tab.bg, color: tab.ink }}>
        <div className="card__bar">
          <button
            className="card__x"
            onClick={onX}
            tabIndex={hidden ? -1 : 0}
            aria-label={isOpen ? `Close ${tab.title}` : `Dismiss ${tab.title}`}
          >
            ×
          </button>
          <span className="card__tab">
            <i style={{ background: tab.bg }} />
            {tab.title}
          </span>
          <span className="card__url">https://{tab.url}</span>
          <span className="card__num">{num}</span>
        </div>

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
      </article>
    </div>
  )
})
