import { useEffect, useRef, type ReactNode } from 'react'
import gsap from 'gsap'
import { CANDY, type Tab } from './data'
import { StoreStudyBody } from './Dimark'

type Props = {
  tab: Tab
  /** true while the tab is open — runs the phone animation */
  active: boolean
  meta: ReactNode
  next: ReactNode
}

const DEPARTMENTS = ['Candy & Chocolate', 'Drinks', 'Snacks', 'Grocery & Pantry', 'Bakery & Cakes', 'Toys & Novelty', 'Vending Machine']

const PRODUCTS: { name: string; pack: string; badge: 'new' | 'out' | 'soon' | null }[] = [
  { name: 'Rolled chips 20 × 92g', pack: 'Case of 20', badge: 'new' },
  { name: 'Fruit drink 24 × 320ml', pack: 'Case of 24', badge: null },
  { name: 'Gummy mix 12 × 150g', pack: 'Case of 12', badge: 'soon' },
  { name: 'Wafer bar 24 × 45g', pack: 'Case of 24', badge: 'out' },
]

const BADGE = { new: 'New', out: 'Sold out', soon: 'Back soon' } as const

const FACTS: [string, string][] = [
  ['VAT', 'Standard'],
  ['Units / case', '20'],
  ['Pallet', '120 cases'],
  ['Barcode', '0 12345 67890 5'],
  ['Returns', 'Eligible'],
]

/** Mobile storefront with department chips, stock badges and a Quick Facts card. */
function PhoneMock({ active }: { active: boolean }) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const root = ref.current
    if (!root) return
    const ctx = gsap.context(() => {
      if (!active || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        gsap.set('.cc__card, .cc__facts', { opacity: 1, y: 0 })
        return
      }
      gsap
        .timeline({ delay: 0.7 })
        .fromTo('.cc__card', { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.5, stagger: 0.12, ease: 'power3.out' })
        .fromTo('.cc__badge', { scale: 0 }, { scale: 1, duration: 0.4, stagger: 0.1, ease: 'back.out(3)' }, '-=0.2')
        .fromTo('.cc__facts', { opacity: 0, x: 24 }, { opacity: 1, x: 0, duration: 0.6, ease: 'power3.out' }, '-=0.2')
        .fromTo('.cc__facts li', { opacity: 0 }, { opacity: 1, duration: 0.25, stagger: 0.08 })
      gsap.to('.cc__chips-track', { xPercent: -50, duration: 14, ease: 'none', repeat: -1 })
    }, root)
    return () => ctx.revert()
  }, [active])

  return (
    <div className="cc" ref={ref} aria-label="Simplified Candy Cargo mobile storefront">
      <div className="cc__phone">
        <div className="cc__notch" />
        <div className="cc__head">
          <strong>CANDY CARGO</strong>
          <span>☰</span>
        </div>
        <div className="cc__chips">
          <div className="cc__chips-track">
            {[...DEPARTMENTS, ...DEPARTMENTS].map((d, i) => (
              <span key={i} className={i % DEPARTMENTS.length === 0 ? 'is-on' : undefined}>
                {d}
              </span>
            ))}
          </div>
        </div>
        <div className="cc__controls">
          <span>Filter</span>
          <span>Sort</span>
        </div>
        <div className="cc__grid">
          {PRODUCTS.map((p) => (
            <div key={p.name} className={`cc__card${p.badge === 'out' ? ' cc__card--out' : ''}`}>
              <div className="cc__img">{p.badge && <span className={`cc__badge cc__badge--${p.badge}`}>{BADGE[p.badge]}</span>}</div>
              <span className="cc__name">{p.name}</span>
              <span className="cc__pack">{p.pack}</span>
              <span className="cc__login">Login for trade price</span>
            </div>
          ))}
        </div>
      </div>

      <aside className="cc__facts">
        <strong>Quick Facts</strong>
        <ul>
          {FACTS.map(([k, v]) => (
            <li key={k}>
              <span>{k}</span>
              <b>{v}</b>
            </li>
          ))}
        </ul>
      </aside>
    </div>
  )
}

/** Candy Cargo: wholesale confectionery store restructure. */
export function CandyBody({ tab, active, meta, next }: Props) {
  return <StoreStudyBody tab={tab} study={CANDY} theme="candy" hero={<PhoneMock active={active} />} meta={meta} next={next} />
}
