import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { PROFILE } from '../data'
import type { ViewMode } from '../layout'
import { Icon, type IconName } from '../Icon'
import { readStr, writeStr } from '../app/util'

const VIEWS: { mode: ViewMode; icon: IconName; label: string; hint: string }[] = [
  { mode: 'stack', icon: 'stack', label: 'Stack', hint: 'Tabs in a browser stack' },
  { mode: 'grid', icon: 'grid', label: 'Grid', hint: 'An app-style home screen' },
  { mode: 'cards', icon: 'cards', label: 'Cards', hint: 'Deal the tabs as playing cards' },
  { mode: 'terminal', icon: 'terminal', label: 'Terminal', hint: 'Browse from a command line' },
]

type Props = {
  view: ViewMode
  onView: (v: ViewMode) => void
  /** the intro has finished: the one-time Explore hint may show */
  ready: boolean
  shuffle?: { run: () => void; disabled: boolean }
  onSearch: () => void
  themeNow: 'day' | 'night'
  themeTitle: string
  onToggleTheme: () => void
  tabCount: number
  onHire: () => void
  hidden: boolean
  style: CSSProperties
}

/**
 * The Stack is the portfolio; the other three views sit behind one Explore menu. A hint
 * points at it once, on a visitor's first visit.
 */
function ExploreMenu({ view, onView, ready, onRaise }: Pick<Props, 'view' | 'onView' | 'ready'> & { onRaise: (up: boolean) => void }) {
  const [open, setOpen] = useState(false)
  const [hint, setHint] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!ready || readStr('explore-hint')) return
    const t = window.setTimeout(() => setHint(true), 900)
    return () => window.clearTimeout(t)
  }, [ready])
  const dismissHint = () => {
    setHint(false)
    writeStr('explore-hint', 'seen')
  }

  useEffect(() => {
    if (!open) return
    const onDown = (e: PointerEvent) => {
      if (!(e.target instanceof Node && ref.current?.contains(e.target))) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('pointerdown', onDown)
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('pointerdown', onDown)
      window.removeEventListener('keydown', onKey)
    }
  }, [open])

  // the menu and the hint drop down over the cards, so the header comes to the front meanwhile
  useEffect(() => onRaise(open || hint), [open, hint, onRaise])

  const current = VIEWS.find((v) => v.mode === view)!
  return (
    <div className="explore" ref={ref}>
      <button
        className={`explore__btn${view !== 'stack' ? ' is-away' : ''}`}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => {
          setOpen((o) => !o)
          if (hint) dismissHint()
        }}
      >
        <Icon name={view === 'stack' ? 'compass' : current.icon} size={15} />
        <span className="explore__label">{view === 'stack' ? 'Explore' : current.label}</span>
        <Icon name="chevronDown" size={13} className="explore__chev" />
      </button>
      {open && (
        <div className="explore__menu" role="menu" aria-label="Ways to browse">
          {VIEWS.map((v) => (
            <button
              key={v.mode}
              role="menuitemradio"
              aria-checked={view === v.mode}
              className={`explore__item${view === v.mode ? ' is-on' : ''}`}
              onClick={() => {
                setOpen(false)
                onView(v.mode)
              }}
            >
              <span className="explore__icon">
                <Icon name={v.icon} size={17} />
              </span>
              <span className="explore__text">
                <strong>{v.label}</strong>
                <em>{v.hint}</em>
              </span>
              {view === v.mode && <Icon name="check" size={15} className="explore__check" />}
            </button>
          ))}
        </div>
      )}
      {hint && !open && (
        <div className="explore__hint" role="status">
          <p>This portfolio can be browsed four ways: a stack, a home screen, a card table or a terminal.</p>
          <button onClick={dismissHint}>Got it</button>
        </div>
      )}
    </div>
  )
}

export function Header({ view, onView, ready, shuffle, onSearch, themeNow, themeTitle, onToggleTheme, tabCount, onHire, hidden, style }: Props) {
  const [raised, setRaised] = useState(false)
  return (
    <div className={`header${raised ? ' header--raised' : ''}`} style={style} aria-hidden={hidden || undefined}>
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
              {label}
              <Icon name="arrowUpRight" size={12} />
            </a>
          ))}
        </nav>
        <div className="header__row">
          <ExploreMenu view={view} onView={onView} ready={ready} onRaise={setRaised} />
          {shuffle && (
            <button className="shuffle" onClick={shuffle.run} disabled={shuffle.disabled}>
              <Icon name="shuffle" size={15} />
              <span className="shuffle__label">Shuffle</span>
            </button>
          )}
          <button className="header__btn" aria-label="Search all tabs" title="Search" onClick={onSearch}>
            <Icon name="search" size={15} />
          </button>
          <button
            className="header__btn"
            aria-label={themeNow === 'day' ? 'Switch to the night theme' : 'Switch to the day theme'}
            title={themeTitle}
            onClick={onToggleTheme}
          >
            <Icon name={themeNow === 'day' ? 'moon' : 'sun'} size={15} />
          </button>
          <span className="header__count">{tabCount} tabs open</span>
          <a href={PROFILE.cv} download>
            CV
            <Icon name="download" size={12} />
          </a>
          <a
            className="header__email"
            href={`mailto:${PROFILE.email}`}
            onClick={(e) => {
              e.preventDefault()
              onHire()
            }}
          >
            {PROFILE.email}
          </a>
          <button className="hire" onClick={onHire}>
            <Icon name="mail" size={15} />
            Hire me
          </button>
        </div>
      </div>
    </div>
  )
}
