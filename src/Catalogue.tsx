import { Fragment, useEffect, useRef, type ReactNode } from 'react'
import gsap from 'gsap'
import { CATALOGUE, type Tab } from './data'
import { Details, Flow, ProjectSummary } from './ProjectParts'

type Props = {
  tab: Tab
  /** true while the tab is open: the catalogue turns its own pages */
  active: boolean
  meta: ReactNode
  next: ReactNode
}

const pad = (i: number) => String(i + 1).padStart(2, '0')
const TOTAL = 212

type Product = [name: string, price: string, hue: number]
type Page =
  | { n: number; kind: 'cover' }
  | { n: number; kind: 'contents' }
  | { n: number; kind: 'flyer'; title: string; deal: string; hue: number; focals: Product[] }
  | { n: number; kind: 'category'; title: string; hue: number }
  | { n: number; kind: 'grid'; band: string; hue: number; groups: [heading: string, products: Product[]][]; more?: boolean }
  | { n: number; kind: 'back' }

// A made-up wholesaler and made-up products: the real catalogue is internal.
const DRINKS: Product[] = [
  ['Cola 24 × 330ml', '£8.49', 4],
  ['Lemonade 24 × 330ml', '£7.99', 52],
  ['Orange soda 24 × 330ml', '£7.99', 30],
  ['Ginger beer 12 × 500ml', '£9.20', 38],
  ['Tonic water 24 × 150ml', '£6.75', 190],
  ['Cream soda 24 × 330ml', '£7.49', 20],
]
const JUICES: Product[] = [
  ['Apple juice 12 × 1L', '£10.80', 85],
  ['Mango nectar 12 × 1L', '£11.40', 40],
  ['Pomegranate 6 × 1L', '£9.90', 350],
]
const SNACKS: Product[] = [
  ['Salted crisps 32 × 25g', '£6.20', 45],
  ['Paprika crisps 32 × 25g', '£6.20', 18],
  ['Pretzels 12 × 150g', '£8.10', 30],
  ['Rice crackers 12 × 100g', '£7.30', 60],
  ['Salted peanuts 24 × 50g', '£9.60', 28],
  ['Popcorn 18 × 80g', '£8.90', 50],
  ['Corn puffs 30 × 20g', '£5.80', 12],
  ['Lentil chips 12 × 90g', '£9.40', 100],
  ['Tortilla chips 12 × 200g', '£10.20', 36],
]

const PAGES: Page[] = [
  { n: 1, kind: 'cover' },
  { n: 2, kind: 'contents' },
  {
    n: 3,
    kind: 'flyer',
    title: 'Autumn deals',
    deal: 'This month only',
    hue: 18,
    focals: [DRINKS[0], JUICES[1]],
  },
  { n: 4, kind: 'category', title: 'Drinks', hue: 212 },
  { n: 5, kind: 'grid', band: 'Drinks', hue: 212, groups: [['Soft drinks', DRINKS]], more: true },
  { n: 6, kind: 'grid', band: 'Drinks', hue: 212, groups: [['Soft drinks (continued)', DRINKS.slice(0, 3)], ['Juices', JUICES]] },
  { n: 7, kind: 'flyer', title: 'Snack week', deal: 'Buy 3 cases, save 10%', hue: 330, focals: [SNACKS[3], SNACKS[5]] },
  { n: 8, kind: 'category', title: 'Snacks', hue: 32 },
  { n: 9, kind: 'grid', band: 'Snacks', hue: 32, groups: [['Crisps & savoury', SNACKS]] },
  { n: TOTAL, kind: 'back' },
]

const CONTENTS: [string, number][] = [
  ['Autumn deals', 3],
  ['Drinks', 4],
  ['Snacks', 8],
  ['Confectionery', 41],
  ['Grocery & pantry', 77],
  ['World foods', 118],
  ['Household', 163],
  ['Index', 205],
]

function Tile({ p }: { p: Product }) {
  const [name, price, hue] = p
  return (
    <div className="catp__tile">
      <i style={{ background: `hsl(${hue} 70% 82%)` }}>
        <b style={{ background: `hsl(${hue} 60% 52%)` }} />
      </i>
      <span>{name}</span>
      <strong>{price}</strong>
    </div>
  )
}

function PageView({ page }: { page: Page }) {
  const foot = page.kind !== 'cover' && page.kind !== 'back' && <span className="catp__foot">{page.n}</span>
  switch (page.kind) {
    case 'cover':
      return (
        <div className="catp catp--cover">
          <span className="catp__brand">BRAMBLEWAY</span>
          <strong>Trade Catalogue</strong>
          <em>Autumn 2026</em>
          <div className="catp__stack">
            {[4, 212, 32, 330].map((h) => (
              <i key={h} style={{ background: `hsl(${h} 65% 60%)` }} />
            ))}
          </div>
          <span className="catp__small">~2,500 products · {TOTAL} pages</span>
        </div>
      )
    case 'contents':
      return (
        <div className="catp catp--contents">
          <strong>Contents</strong>
          <ol>
            {CONTENTS.map(([name, n]) => (
              <li key={name}>
                <span>{name}</span>
                <i />
                <b>{n}</b>
              </li>
            ))}
          </ol>
          {foot}
        </div>
      )
    case 'flyer':
      return (
        <div className="catp catp--flyer" style={{ background: `hsl(${page.hue} 85% 55%)` }}>
          <em>{page.deal}</em>
          <strong>{page.title}</strong>
          <div className="catp__focals">
            {page.focals.map((f) => (
              <div key={f[0]} className="catp__focal">
                <Tile p={f} />
                <span className="catp__qr" />
              </div>
            ))}
          </div>
          {foot}
        </div>
      )
    case 'category':
      return (
        <div className="catp catp--category" style={{ background: `hsl(${page.hue} 55% 42%)` }}>
          <em>Section</em>
          <strong>{page.title}</strong>
          {foot}
        </div>
      )
    case 'grid':
      return (
        <div className="catp catp--grid">
          <span className="catp__band" style={{ background: `hsl(${page.hue} 55% 42%)` }}>
            {page.band}
          </span>
          {page.groups.map(([heading, products]) => (
            <Fragment key={heading}>
              <span className="catp__sub">{heading}</span>
              <div className="catp__grid">
                {products.map((p) => (
                  <Tile key={p[0]} p={p} />
                ))}
              </div>
            </Fragment>
          ))}
          {page.more && <span className="catp__more">Continued overleaf →</span>}
          {foot}
        </div>
      )
    case 'back':
      return (
        <div className="catp catp--back">
          <span className="catp__brand">BRAMBLEWAY</span>
          <span className="catp__small">Prices exclude VAT · Illustration only</span>
        </div>
      )
  }
}

/**
 * A PDF viewer showing a made-up trade catalogue that turns its own pages: cover, contents,
 * a flyer with product overlays, category covers, packed product pages (one continuing
 * overleaf) and the back cover, then round again.
 */
function CatalogueScroll({ active }: { active: boolean }) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const root = ref.current
    if (!root) return
    const track = root.querySelector<HTMLElement>('.catv__track')!
    const pages = [...track.querySelectorAll<HTMLElement>('.catv__page')]
    const thumbs = [...root.querySelectorAll<HTMLElement>('.catv__thumb')]
    const counter = root.querySelector<HTMLElement>('.catv__count')!
    // the last page in the track is a copy of the cover, so the loop can jump back unseen
    const show = (i: number) => {
      const k = i % PAGES.length
      counter.textContent = `${PAGES[k].n} / ${TOTAL}`
      thumbs.forEach((t, j) => t.classList.toggle('is-on', j === k))
    }

    const ctx = gsap.context(() => {
      show(0)
      gsap.set(track, { y: 0 })
      if (!active || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

      const tl = gsap.timeline({ delay: 0.8, repeat: -1, repeatRefresh: true })
      for (let i = 1; i < pages.length; i++) {
        tl.to({}, { duration: i === 1 ? 1.4 : 1.1 })
        // measured each loop, so a resized tab never scrolls to stale positions
        tl.to(track, { y: () => -(pages[i].offsetTop - 18), duration: 0.85, ease: 'power2.inOut', onStart: () => show(i) })
      }
      tl.set(track, { y: 0 })

      const pause = () => tl.pause()
      const play = () => tl.resume()
      root.addEventListener('mouseenter', pause)
      root.addEventListener('mouseleave', play)
      return () => {
        root.removeEventListener('mouseenter', pause)
        root.removeEventListener('mouseleave', play)
      }
    }, root)
    return () => ctx.revert()
  }, [active])

  return (
    <div className="catv" ref={ref} role="img" aria-label="Illustration: a made-up trade catalogue scrolling through its pages">
      <div className="catv__frame" aria-hidden>
        <div className="catv__bar">
          <span />
          <span />
          <span />
          <em>trade-catalogue-autumn.pdf</em>
          <b className="catv__count">1 / {TOTAL}</b>
        </div>
        <div className="catv__body">
          <div className="catv__rail">
            {PAGES.map((p) => (
              <span key={p.n} className={`catv__thumb catv__thumb--${p.kind}`} />
            ))}
          </div>
          <div className="catv__window">
            <div className="catv__track">
              {[...PAGES, PAGES[0]].map((p, i) => (
                <div key={i} className="catv__page">
                  <PageView page={p} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <p className="catv__note">Illustration · made-up company, products and prices</p>
    </div>
  )
}

/** Catalogue Maker: flyers, product overlays, the A4 layout and PDF compression. */
export function CatalogueBody({ tab, active, meta, next }: Props) {
  const d = CATALOGUE
  return (
    <div className="edu catm">
      <div className="edu__top">
        <div className="edu__intro">
          <h3 className="exp__headline" data-reveal>
            {d.subtitle}
          </h3>
          <p className="card__lead" data-reveal>
            {tab.description}
          </p>
          {meta}
        </div>
        <div className="catm__hero" data-reveal>
          <CatalogueScroll active={active} />
        </div>
      </div>

      <ProjectSummary summary={d.summary} />

      <section className="panel" data-reveal>
        <span className="panel__label">01 · Context</span>
        <p className="cs__text">{d.context}</p>
      </section>

      <section className="panel" data-reveal>
        <span className="panel__label">02 · Four tools, one catalogue</span>
        <ul className="catm__parts">
          {d.parts.map((p, i) => (
            <li key={p.id} id={`catm-${p.id}`}>
              <span className="exp__num">{pad(i)}</span>
              <h3>{p.name}</h3>
              <em>{p.tag}</em>
              <p>{p.text}</p>
              <ul className="cs__impact">
                {p.built.map((b) => (
                  <li key={b}>{b}</li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </section>

      <div className="exp__bottom" data-reveal>
        <section className="panel">
          <span className="panel__label">Before</span>
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
      <p className="portal__note" data-reveal>
        This compares workflows, not measured savings. The file sizes are typical results, not a benchmark.
      </p>

      <section className="panel" data-reveal>
        <span className="panel__label">My role</span>
        <div className="nisa__cols">
          {d.role.map((p) => (
            <p key={p} className="cs__text">
              {p}
            </p>
          ))}
        </div>
      </section>

      <Details>
        <section className="panel">
          <span className="panel__label">03 · Architecture</span>
          <ol className="cs__arch">
            {d.architecture.map(([layer, text]) => (
              <li key={layer}>
                <strong>{layer}</strong>
                <span>{text}</span>
              </li>
            ))}
          </ol>
        </section>

        <section className="panel">
          <span className="panel__label">04 · The two pipelines</span>
          <div className="cs__flow-row">
            <span className="cs__flow-label">PDF Extract</span>
            <Flow steps={d.extractFlow} main />
          </div>
          <div className="cs__flow-row">
            <span className="cs__flow-label">Compact</span>
            <Flow steps={d.compactFlow} />
          </div>
        </section>

        <section className="panel">
          <span className="panel__label">05 · Decisions that shaped it</span>
          <ul className="cs__features">
            {d.decisions.map(([title, text], i) => (
              <li key={title}>
                <span className="exp__num">{pad(i)}</span>
                <h3>{title}</h3>
                <p>{text}</p>
              </li>
            ))}
          </ul>
        </section>

        <div className="exp__bottom">
          <section className="panel">
            <span className="panel__label">06 · Known limits</span>
            <ul className="pm__notes">
              {d.limits.map((x) => (
                <li key={x}>{x}</li>
              ))}
            </ul>
          </section>
          <section className="panel">
            <span className="panel__label">07 · What I’d do next</span>
            <ul className="cs__impact">
              {d.next.map((x) => (
                <li key={x}>{x}</li>
              ))}
            </ul>
          </section>
        </div>

        <section className="panel cs__dark">
          <span className="panel__label">08 · What I learned</span>
          <p className="cs__quote">{d.learned}</p>
        </section>
      </Details>

      <a className="portal__repo catm__repo" href={`https://${d.repo}`} target="_blank" rel="noreferrer" data-reveal>
        <span>
          <em>Public repository on GitHub</em>
          {d.repo}
        </span>
        <b aria-hidden>↗</b>
      </a>

      <p className="ukm__privacy" data-reveal>
        {d.privacy}
      </p>

      {next}
    </div>
  )
}
