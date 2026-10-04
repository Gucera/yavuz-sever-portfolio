import { useEffect, useRef, type ReactNode } from 'react'
import gsap from 'gsap'
import { DIMARK, type StoreStudy, type Tab } from './data'

type Props = {
  tab: Tab
  /** true while the tab is open — runs the shopping animation */
  active: boolean
  meta: ReactNode
  next: ReactNode
}

const pad = (i: number) => String(i + 1).padStart(2, '0')

const MOCK_PRODUCTS = [
  { name: 'Product name 12 × 400g', pack: '£14.99', unit: '£1.25', sku: 'SKU 10482', stock: 'In stock' },
  { name: 'Product name 24 × 330ml', pack: '£11.49', unit: '£0.48', sku: 'SKU 20917', stock: 'In stock' },
  { name: 'Product name 6 × 1kg', pack: '£18.90', unit: '£3.15', sku: 'SKU 31455', stock: 'Sold out' },
]

/** Monitor showing the storefront, with a cursor doing a short shopping run. */
function ShopScreen({ active }: { active: boolean }) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const root = ref.current
    if (!root) return
    const ctx = gsap.context(() => {
      const q = <T extends Element>(sel: string) => root.querySelector<T>(sel)!
      const screen = q<HTMLElement>('.shop__screen')
      const count = q<HTMLElement>('.store__count')
      const adds = root.querySelectorAll<HTMLButtonElement>('.store__add')
      const hearts = root.querySelectorAll<HTMLElement>('.store__heart')
      const toast = q<HTMLElement>('.store__toast')

      const reset = () => {
        count.textContent = '0'
        adds.forEach((b, i) => {
          if (i < 2) b.textContent = '+ Add'
          b.classList.remove('is-added')
        })
        hearts.forEach((h) => {
          h.textContent = '♡'
          h.classList.remove('is-on')
        })
        gsap.set(toast, { autoAlpha: 0, y: -6 })
      }
      // Cursor tip position for the centre of an element, relative to the screen.
      const at = (el: Element) => {
        const r = el.getBoundingClientRect()
        const s = screen.getBoundingClientRect()
        return { x: r.left - s.left + r.width / 2, y: r.top - s.top + r.height / 2 }
      }
      const click = (tl: gsap.core.Timeline) =>
        tl.to('.shop__cursor', { scale: 0.82, duration: 0.09 }).to('.shop__cursor', { scale: 1, duration: 0.14 })

      reset()
      gsap.set('.shop__cursor', { x: 40, y: 260, autoAlpha: active ? 1 : 0 })
      if (!active || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

      const tl = gsap.timeline({ delay: 1, repeat: -1, repeatDelay: 1.2, repeatRefresh: true, onRepeat: reset })
      // Measured when each move starts (and again every loop) so layout changes can't leave stale targets.
      const move = (el: Element, d = 0.9) =>
        tl.to('.shop__cursor', { x: () => at(el).x, y: () => at(el).y, duration: d, ease: 'power2.inOut' })
      const add = (i: number, total: string) => {
        move(adds[i])
        click(tl).call(() => {
          adds[i].textContent = '✓ Added'
          adds[i].classList.add('is-added')
          count.textContent = total
        })
        tl.fromTo('.store__count', { scale: 1.6 }, { scale: 1, duration: 0.35, ease: 'back.out(3)' })
      }

      add(0, '1')
      move(hearts[1], 0.8)
      click(tl).call(() => {
        hearts[1].textContent = '♥'
        hearts[1].classList.add('is-on')
      })
      add(1, '2')
      move(q('.store__cart'), 1)
      click(tl).to(toast, { autoAlpha: 1, y: 0, duration: 0.3 })
      tl.to({}, { duration: 1.8 })
      tl.to('.shop__cursor', { x: 40, y: 260, duration: 1, ease: 'power2.inOut' })
    }, root)
    return () => ctx.revert()
  }, [active])

  return (
    <div className="shop" ref={ref} aria-label="Animated storefront: a cursor adds products to the basket">
      <div className="shop__monitor">
        <div className="shop__screen">
          <div className="store">
            <div className="store__bar">
              <span />
              <span />
              <span />
              <em>dimarkltd.co.uk</em>
            </div>
            <div className="store__nav">
              <strong>DIMARK</strong>
              {['Food', 'Drinks', 'Confectionery', 'Brands'].map((c) => (
                <span key={c}>{c}</span>
              ))}
              <span className="store__account">Trade account</span>
              <span className="store__cart">
                Basket <b className="store__count">0</b>
              </span>
            </div>
            <div className="store__grid">
              {MOCK_PRODUCTS.map((p) => (
                <div key={p.sku} className={`store__card${p.stock === 'Sold out' ? ' store__card--out' : ''}`}>
                  <div className="store__img">
                    <span className="store__heart">♡</span>
                  </div>
                  <span className="store__name">{p.name}</span>
                  <div className="store__price">
                    <strong>{p.pack}</strong>
                    <span>{p.unit} / item</span>
                  </div>
                  <span className="store__sku">
                    {p.sku} · {p.stock}
                  </span>
                  <button tabIndex={-1} className="store__add">
                    {p.stock === 'Sold out' ? 'Sold out' : '+ Add'}
                  </button>
                </div>
              ))}
            </div>
            <div className="store__toast">2 items in basket · £26.48</div>
          </div>
          <svg className="shop__cursor" width="22" height="22" viewBox="0 0 22 22" aria-hidden>
            <path d="M2 1 L2 18 L7 13.5 L10.5 21 L13.5 19.6 L10 12.3 L16.5 12.3 Z" fill="#fff" stroke="#111" strokeWidth="1.6" strokeLinejoin="round" />
          </svg>
        </div>
      </div>
      <div className="shop__neck" />
      <div className="shop__base" />
    </div>
  )
}

/** Dimark Online: B2B ecommerce redesign case study. */
export function DimarkBody({ tab, active, meta, next }: Props) {
  return (
    <StoreStudyBody tab={tab} study={DIMARK} theme="dmk" hero={<ShopScreen active={active} />} meta={meta} next={next} />
  )
}

type StudyProps = {
  tab: Tab
  study: StoreStudy
  /** scoping class for colours */
  theme: string
  hero: ReactNode
  meta: ReactNode
  next: ReactNode
}

/** Shared layout for the Shopify storefront case studies. */
export function StoreStudyBody({ tab, study: d, theme, hero, meta, next }: StudyProps) {
  const host = d.site.replace(/^https?:\/\//, '')
  return (
    <div className={`edu ${theme}`}>
      <div className="edu__top">
        <div className="edu__intro">
          <h3 className="exp__headline" data-reveal>
            {d.subtitle}
          </h3>
          <p className="card__lead" data-reveal>
            {tab.description}
          </p>
          {meta}
          <a className="dmk__visit" href={d.site} target="_blank" rel="noreferrer" data-reveal>
            Visit {host} ↗
          </a>
        </div>
        <div className="dmk__hero" data-reveal>
          {hero}
          <div className="cs__stats">
            {d.stats.map(([value, label]) => (
              <div key={label}>
                <strong>{value}</strong>
                <span>{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <section className="panel" data-reveal>
        <span className="panel__label">01 · Context</span>
        <p className="cs__text">{d.context}</p>
        <div className="exp__bottom">
          {d.behaviours.map(([title, text]) => (
            <div key={title} className="dmk__behaviour">
              <strong>{title}</strong>
              <span>{text}</span>
            </div>
          ))}
        </div>
      </section>

      <div className="exp__bottom" data-reveal>
        <section className="panel">
          <span className="panel__label">02 · The problem</span>
          {d.problem.map((p) => (
            <p key={p} className="cs__text">
              {p}
            </p>
          ))}
        </section>
        <section className="panel">
          <span className="panel__label">03 · Goals</span>
          <ul className="cs__impact">
            {d.goals.map((g) => (
              <li key={g}>{g}</li>
            ))}
          </ul>
        </section>
      </div>

      <div className="exp__bottom" data-reveal>
        <section className="panel">
          <span className="panel__label">04 · Before</span>
          <ol className="ba ba--before">
            {d.before.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ol>
        </section>
        <section className="panel cs__dark">
          <span className="panel__label">After</span>
          <ol className="ba ba--after">
            {d.after.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ol>
        </section>
      </div>

      <section className="panel" data-reveal>
        <span className="panel__label">05 · Key changes</span>
        <ul className="cs__features">
          {d.changes.map(([title, text], i) => (
            <li key={title}>
              <span className="exp__num">{pad(i)}</span>
              <h3>{title}</h3>
              <p>{text}</p>
            </li>
          ))}
        </ul>
      </section>

      <div className="exp__bottom" data-reveal>
        <section className="panel">
          <span className="panel__label">06 · UX decisions</span>
          <ul className="cs__impact">
            {d.decisions.map((x) => (
              <li key={x}>{x}</li>
            ))}
          </ul>
        </section>
        <section className="panel">
          <span className="panel__label">07 · Shopify implementation</span>
          <ul className="exp__stack">
            {d.shopify.map((x) => (
              <li key={x}>{x}</li>
            ))}
          </ul>
        </section>
      </div>

      <div className="exp__bottom" data-reveal>
        <section className="panel cs__dark">
          <span className="panel__label">08 · Challenges</span>
          {d.challenges.map(([title, text]) => (
            <div key={title} className="dmk__behaviour">
              <strong>{title}</strong>
              <span>{text}</span>
            </div>
          ))}
        </section>
        <section className="panel">
          <span className="panel__label">09 · Impact</span>
          <p className="dmk__note">{d.impactNote}</p>
          <ul className="cs__impact">
            {d.impact.map((x) => (
              <li key={x}>{x}</li>
            ))}
          </ul>
        </section>
      </div>

      <section className="panel" data-reveal>
        <span className="panel__label">10 · Learnings</span>
        <div className="nisa__cols">
          {d.learned.map((p) => (
            <p key={p} className="cs__text">
              {p}
            </p>
          ))}
        </div>
      </section>

      {next}
    </div>
  )
}
