import { useEffect, useState, type CSSProperties, type ReactNode } from 'react'
import { UKMAP, type Tab } from './data'

type Props = {
  tab: Tab
  /** true while the tab is open: the map tilts into its 3D clay model */
  active: boolean
  meta: ReactNode
  next: ReactNode
}

const pad = (i: number) => String(i + 1).padStart(2, '0')

// ---- an illustrative neighbourhood (made up, not real data) ----
const W = 640
const H = 420
type Rect = { x: number; y: number; w: number; h: number }

// the high street bends a little on its way down the map
const MAIN = [
  [292, 0],
  [300, 95],
  [318, 210],
  [330, 330],
  [336, 420],
]
const ROWS = [0, 95, 210, 330, 420]
const COLS = [0, 112, 480, 582, 610]

/** Tiny deterministic random, so the drawing is the same on every render. */
function rng(seed: number) {
  let s = seed
  return () => {
    s = (s * 16807) % 2147483647
    return s / 2147483647
  }
}

/** Terraced houses along the top and bottom edges of each block. */
function buildBlocks() {
  const rnd = rng(7)
  const houses: Rect[] = []
  const big: Rect[] = []
  const parks: Rect[] = []
  for (let r = 0; r < ROWS.length - 1; r++) {
    const y0 = ROWS[r] + 9
    const y1 = ROWS[r + 1] - 9
    const roadL = Math.min(MAIN[r][0], MAIN[r + 1][0]) - 13
    const roadR = Math.max(MAIN[r][0], MAIN[r + 1][0]) + 13
    const cells: [number, number][] = [
      [COLS[0] + 6, COLS[1] - 9],
      [COLS[1] + 9, roadL],
      [roadR, COLS[2] - 9],
      [COLS[2] + 9, COLS[3] - 9],
    ]
    cells.forEach(([x0, x1], c) => {
      if (c === 3 && r === 1) {
        // a trading estate: a few large sheds
        big.push({ x: x0 + 4, y: y0 + 6, w: 52, h: 40 }, { x: x0 + 4, y: y0 + 54, w: 80, h: 42 }, { x: x0 + 62, y: y0 + 6, w: 26, h: 40 })
        return
      }
      if (c === 1 && r === 2) {
        parks.push({ x: x0, y: y0, w: x1 - x0, h: y1 - y0 })
        return
      }
      for (const edge of [0, 1]) {
        const depth = 15 + rnd() * 5
        const y = edge ? y1 - depth : y0
        let x = x0
        while (x < x1 - 8) {
          const w = Math.min(9 + rnd() * 6, x1 - x)
          houses.push({ x, y, w: w - 1.4, h: depth })
          x += w
        }
      }
    })
  }
  return { houses, big, parks }
}

// the selected terrace: one OSM polygon, six shops, sliced at house-number bisectors
const TERRACE = { x: 352, y: 222, w: 114, h: 20 }
const NUMBERS = ['527', '531', '535', '539', '541', '545']
const PICKED = [3, 4] // "539–541"

const blocks = buildBlocks()
// the terrace replaces the generated houses it sits on
const houses = blocks.houses.filter(
  (b) => b.x + b.w < TERRACE.x - 2 || b.x > TERRACE.x + TERRACE.w + 2 || b.y + b.h < TERRACE.y - 2 || b.y > TERRACE.y + TERRACE.h + 2,
)
const { big, parks } = blocks
// a handful of houses that are customers (purple), raised in 3D
const CUSTOMERS = [9, 34, 61, 97, 128, 170, 203, 236].filter((i) => i < houses.length).map((i) => houses[i])
// prospect shops that aren't customers yet
const PROSPECTS = (() => {
  const rnd = rng(31)
  return Array.from({ length: 16 }, () => [30 + rnd() * 560, 20 + rnd() * 380] as [number, number])
})()
const pct = (v: number, of: number) => `${(v / of) * 100}%`

// "Fit UK": a simplified outline of Great Britain and Northern Ireland (lon, lat), drawn coarse
// on purpose, with a prospect-density heatmap over the big towns (public geography, not customers)
const GB: [number, number][] = [
  [-5, 58.6], [-3, 58.65], [-3.1, 58.4], [-4, 57.9], [-3.8, 57.6], [-2, 57.7], [-1.8, 57.4], [-2.1, 57.1], [-2.5, 56.6],
  [-3, 56.4], [-2.6, 56.05], [-3.3, 55.98], [-2.1, 55.8], [-1.6, 55.6], [-1.4, 55], [-1.2, 54.6], [-0.5, 54.45], [-0.1, 54.1],
  [0.1, 53.6], [0.35, 53.2], [0.25, 52.95], [0.4, 52.8], [1.3, 52.95], [1.75, 52.6], [1.6, 52.1], [1.25, 51.85], [0.9, 51.75],
  [0.6, 51.5], [1.4, 51.35], [1.35, 51.15], [0.95, 50.95], [0.3, 50.75], [-0.8, 50.75], [-1.3, 50.8], [-2, 50.6], [-3, 50.68],
  [-3.6, 50.25], [-4.2, 50.35], [-5.1, 50], [-5.7, 50.05], [-5, 50.45], [-4.2, 51], [-3.4, 51.2], [-2.7, 51.5], [-3.3, 51.4],
  [-4.2, 51.55], [-5.2, 51.7], [-4.6, 52.1], [-4.1, 52.45], [-4.1, 52.9], [-4.6, 52.85], [-4.3, 53.2], [-3.1, 53.3],
  [-2.95, 53.75], [-3.05, 54.05], [-3.6, 54.5], [-3.3, 54.9], [-4.4, 54.7], [-4.9, 54.85], [-5.1, 55.1], [-4.6, 55.5],
  [-4.9, 55.9], [-5.5, 55.5], [-5.7, 55.3], [-5.6, 56.3], [-6.1, 56.7], [-5.7, 57], [-5.8, 57.6], [-5.1, 58.2],
]
const NI: [number, number][] = [
  [-5.5, 54.3], [-5.9, 54.6], [-6, 55.2], [-7.2, 55.3], [-7.9, 55.05], [-8.1, 54.6], [-7.4, 54.15], [-6.3, 54.05],
]
// [lon, lat, weight] — roughly where independent shops cluster
const HEAT: [number, number, number][] = [
  [-0.1, 51.5, 1], [-1.9, 52.48, 0.7], [-2.24, 53.48, 0.7], [-1.55, 53.8, 0.5], [-1.47, 53.38, 0.4], [-4.25, 55.86, 0.5],
  [-3.19, 55.95, 0.35], [-2.6, 51.45, 0.4], [-3.18, 51.48, 0.35], [-1.15, 52.95, 0.4], [-1.13, 52.63, 0.4], [-1.6, 54.97, 0.35],
  [-2.98, 53.41, 0.45], [0.9, 51.4, 0.3], [-1.4, 50.9, 0.3], [-5.93, 54.6, 0.3], [-0.75, 52.05, 0.25], [1.3, 52.63, 0.2],
]
const geo = ([lon, lat]: [number, number] | [number, number, number]) => [(lon + 8.4) * 30, (58.9 - lat) * 48] as const
const outline = (pts: [number, number][]) => pts.map((p) => geo(p).join(',')).join(' ')

function UkView() {
  return (
    <svg className="ukmap__uk" viewBox="0 0 330 440" aria-hidden>
      <defs>
        <radialGradient id="ukheat">
          <stop offset="0" stopColor="#6a59b5" stopOpacity="0.85" />
          <stop offset="0.45" stopColor="#9686da" stopOpacity="0.45" />
          <stop offset="1" stopColor="#b8a9e6" stopOpacity="0" />
        </radialGradient>
      </defs>
      <polygon points={outline(GB)} className="ukmap__uk-land" />
      <polygon points={outline(NI)} className="ukmap__uk-land" />
      {HEAT.map((h, i) => {
        const [x, y] = geo(h)
        return <circle key={i} cx={x} cy={y} r={10 + h[2] * 26} fill="url(#ukheat)" />
      })}
    </svg>
  )
}

function Box({ r, h, tone }: { r: Rect; h: number; tone: 'customer' | 'picked' }) {
  return (
    <div
      className={`ukmap__box ukmap__box--${tone}`}
      style={{ left: pct(r.x, W), top: pct(r.y, H), width: pct(r.w, W), height: pct(r.h, H), '--h': `${h}px` } as CSSProperties}
    >
      <i className="ukmap__face ukmap__face--s" />
      <i className="ukmap__face ukmap__face--e" />
      <i className="ukmap__face ukmap__face--w" />
      <i className="ukmap__face ukmap__face--top" />
    </div>
  )
}

/** The map, drawn: a 2D analytic view that tilts into a 3D clay model when the tab opens. */
function MapArt({ active }: { active: boolean }) {
  const [mode, setMode] = useState<'2d' | '3d' | 'uk' | 'street'>('2d')
  useEffect(() => {
    if (!active) return setMode('2d')
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const t = window.setTimeout(() => setMode('3d'), 1100)
    return () => window.clearTimeout(t)
  }, [active])

  const slice = TERRACE.w / NUMBERS.length
  return (
    <div className={`ukmap ukmap--${mode}`} aria-label="Illustration of the customer map, switching between 2D and 3D" role="img">
      <div className="ukmap__view">
        <div className="ukmap__plane">
          <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" aria-hidden>
            <rect width={W} height={H} className="ukmap__land" />
            <rect x={622} width={18} height={H} className="ukmap__water" />
            {parks.map((p, i) => (
              <rect key={i} x={p.x} y={p.y} width={p.w} height={p.h} rx={6} className="ukmap__park" />
            ))}
            {/* roads */}
            <g className="ukmap__road">
              {ROWS.slice(1, -1).map((y) => (
                <line key={y} x1={0} y1={y} x2={612} y2={y} />
              ))}
              {[COLS[1], COLS[2], COLS[3]].map((x) => (
                <line key={x} x1={x} y1={0} x2={x} y2={H} />
              ))}
              <polyline className="ukmap__high" points={MAIN.map((p) => p.join(',')).join(' ')} />
            </g>
            <g className="ukmap__rail">
              <line x1={614} y1={0} x2={614} y2={H} />
              <line x1={618} y1={0} x2={618} y2={H} />
            </g>
            {/* buildings */}
            <g className="ukmap__bldg">
              {houses.map((b, i) => (
                <rect key={i} x={b.x} y={b.y} width={b.w} height={b.h} />
              ))}
              {big.map((b, i) => (
                <rect key={i} x={b.x} y={b.y} width={b.w} height={b.h} />
              ))}
            </g>
            <g className="ukmap__cust">
              {CUSTOMERS.map((b, i) => (
                <rect key={i} x={b.x} y={b.y} width={b.w} height={b.h} />
              ))}
            </g>
            {/* the selected terrace, sliced */}
            <rect x={TERRACE.x} y={TERRACE.y} width={TERRACE.w} height={TERRACE.h} className="ukmap__terrace" />
            <rect x={TERRACE.x + slice * PICKED[0]} y={TERRACE.y} width={slice * PICKED.length} height={TERRACE.h} className="ukmap__picked" />
            <g className="ukmap__cuts">
              {NUMBERS.slice(1).map((_, i) => (
                <line key={i} x1={TERRACE.x + slice * (i + 1)} y1={TERRACE.y} x2={TERRACE.x + slice * (i + 1)} y2={TERRACE.y + TERRACE.h} />
              ))}
            </g>
            <g className="ukmap__nums">
              {NUMBERS.map((n, i) => (
                <text key={n} x={TERRACE.x + slice * (i + 0.5)} y={TERRACE.y + 13.5} className={PICKED.includes(i) ? 'is-picked' : undefined}>
                  {n}
                </text>
              ))}
            </g>
            {/* prospects */}
            <g className="ukmap__prospects">
              {PROSPECTS.map(([x, y], i) => (
                <circle key={i} cx={x} cy={y} r={4.2} style={{ animationDelay: `${(i % 6) * 0.35}s` }} />
              ))}
            </g>
            <circle cx={TERRACE.x + slice * 5} cy={TERRACE.y + TERRACE.h + 9} r={4.5} className="ukmap__pin" />
          </svg>
          {CUSTOMERS.map((b, i) => (
            <Box key={i} r={b} h={14 + (i % 3) * 6} tone="customer" />
          ))}
          <Box r={{ x: TERRACE.x + slice * PICKED[0], y: TERRACE.y, w: slice * PICKED.length, h: TERRACE.h }} h={22} tone="picked" />
        </div>
        <div className="ukmap__sky" aria-hidden />
        <UkView />
      </div>

      {/* the app's own controls */}
      <div className="ukmap__ctl">
        <button type="button" className={mode === '2d' ? 'is-on' : undefined} onClick={() => setMode('2d')}>
          2D
        </button>
        <button type="button" className={mode === '3d' ? 'is-on' : undefined} onClick={() => setMode('3d')}>
          3D
        </button>
        <button type="button" className={mode === 'uk' ? 'is-on' : undefined} onClick={() => setMode('uk')}>
          Fit UK
        </button>
        <button type="button" className={mode === 'street' ? 'is-on' : undefined} onClick={() => setMode('street')}>
          Street view
        </button>
      </div>
      <span className="ukmap__report" aria-hidden>
        ‹ Report
      </span>
      <span className="ukmap__hint" aria-hidden>
        {mode === 'uk' ? 'Prospect density · zoom in for dots and buildings' : 'Street view · WASD to walk · drag to look · Esc to leave'}
      </span>
      <div className="ukmap__legend" aria-hidden>
        <span>
          <i className="is-cust" />
          Customer
        </span>
        <span>
          <i className="is-pick" />
          Selected shop
        </span>
        <span>
          <i className="is-pros" />
          Prospect
        </span>
      </div>
      <span className="ukmap__scale" aria-hidden>
        50 m
      </span>
    </div>
  )
}

/** Small diagram: one OSM polygon for six shops, cut at the house-number bisectors. */
function Slicing() {
  return (
    <svg className="ukmap__slice" viewBox="0 0 440 150" role="img" aria-label="A terrace drawn as one building is sliced between house numbers and only the shop's slices are painted">
      <text x="0" y="14" className="t-head">
        Before: one polygon, six shops lit
      </text>
      <rect x="0" y="24" width="440" height="40" rx="3" className="s-before" />
      {NUMBERS.map((n, i) => (
        <text key={n} x={36 + i * 73} y="49" className="t-num">
          {n}
        </text>
      ))}
      <text x="0" y="90" className="t-head">
        After: sliced at house-number bisectors
      </text>
      <rect x="0" y="100" width="440" height="40" rx="3" className="s-after" />
      <rect x={73 * 3} y="100" width={146} height="40" className="s-pick" />
      {[1, 2, 3, 4, 5].map((i) => (
        <line key={i} x1={i * 73} y1="100" x2={i * 73} y2="140" className="s-cut" />
      ))}
      {NUMBERS.map((n, i) => (
        <text key={n} x={36 + i * 73} y="125" className={`t-num${PICKED.includes(i) ? ' is-picked' : ''}`}>
          {n}
        </text>
      ))}
    </svg>
  )
}

/** UK Customer Map: geospatial full-stack case study. */
export function UkMapBody({ tab, active, meta, next }: Props) {
  const a = UKMAP.architecture
  const node = (key: string, cls: string) => (
    <div className={`ukm__node ${cls}`}>
      <strong>{a[key][0]}</strong>
      <span>{a[key][1]}</span>
    </div>
  )
  const tones = ['b', 's', 'p', 'n']

  return (
    <div className="edu ukm">
      <div className="edu__top">
        <div className="edu__intro">
          <h3 className="exp__headline" data-reveal>
            {UKMAP.subtitle}
          </h3>
          <p className="card__lead" data-reveal>
            {tab.description}
          </p>
          {meta}
        </div>
        <div data-reveal>
          <MapArt active={active} />
        </div>
      </div>

      <ul className="ukm__stats" data-reveal>
        {UKMAP.stats.map(([value, label]) => (
          <li key={label}>
            <strong>{value}</strong>
            <span>{label}</span>
          </li>
        ))}
      </ul>

      <section className="panel" data-reveal>
        <span className="panel__label">01 · The problem</span>
        <div className="nisa__cols">
          {UKMAP.problem.map((p) => (
            <p key={p} className="cs__text">
              {p}
            </p>
          ))}
        </div>
        <ul className="ukm__constraints">
          {UKMAP.constraints.map(([title, text]) => (
            <li key={title}>
              <strong>{title}</strong>
              <span>{text}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="panel" data-reveal>
        <span className="panel__label">02 · One map page, six capabilities</span>
        <ul className="cs__features">
          {UKMAP.features.map(([title, text], i) => (
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
          <span className="panel__label">03 · From messy address to one building</span>
          <ol className="ukm__steps">
            {UKMAP.pipeline.map(([title, text]) => (
              <li key={title}>
                <strong>{title}</strong>
                <span>{text}</span>
              </li>
            ))}
          </ol>
        </section>
        <section className="panel ukm__result">
          <span className="panel__label">Result · customer address precision</span>
          {UKMAP.precision.map(([label, parts]) => (
            <div key={label} className="ukm__bar-row">
              <span>{label}</span>
              <div className="ukm__bar">
                {parts.map((v, i) => (
                  <i key={i} className={`ukm__seg ukm__seg--${tones[i]}`} style={{ width: `${v}%` }}>
                    {v >= 8 ? `${v}%` : ''}
                  </i>
                ))}
              </div>
            </div>
          ))}
          <div className="ukm__legend">
            <span>
              <i className="ukm__seg--b" />
              Building
            </span>
            <span>
              <i className="ukm__seg--s" />
              Street
            </span>
            <span>
              <i className="ukm__seg--p" />
              Postcode only
            </span>
            <span>
              <i className="ukm__seg--n" />
              Not found
            </span>
          </div>
          <p className="cs__text">
            Building-level matches rose from 22% to 68% of customers, and postcode-only fell from 55% to 9%. Most of the old misses had
            never really been searched: rate-limit errors were being saved as “not found”.
          </p>
        </section>
      </div>

      <section className="panel" data-reveal>
        <span className="panel__label">04 · Painting one shop, not the whole terrace</span>
        <div className="ukm__slicing">
          <div className="ukm__slicing-text">
            <p className="cs__text">
              OpenStreetMap often draws a row of twenty terraced shops as one building, and vector tiles can merge same-type buildings into one
              feature over a kilometre long. The first version painted the whole feature, so picking one shop lit up a neighbourhood. The fix
              runs in the browser, on tile geometry:
            </p>
            <ul className="ukm__list">
              {UKMAP.slicing.map(([title, text]) => (
                <li key={title}>
                  <strong>{title}.</strong> {text}
                </li>
              ))}
            </ul>
          </div>
          <Slicing />
        </div>
      </section>

      <div className="exp__bottom" data-reveal>
        <section className="panel">
          <span className="panel__label">05 · Every independent food shop that isn’t a customer</span>
          <p className="cs__text">
            Every UK food business must register with its council, and the Food Standards Agency publishes that register as open data. That
            became the base list; OpenStreetMap filled the gaps. A pilot on one London borough checked the customer matcher by hand before
            loading the whole country. A rule-based classifier sorts shops into grocery, European, world food, off-licence, newsagent and
            specialist, and drops big chains.
          </p>
        </section>
        <section className="panel cs__dark">
          <span className="panel__label">Drawing ~98k points smoothly</span>
          <ul className="ukm__zoom">
            {UKMAP.zoom.map(([z, text]) => (
              <li key={z}>
                <b>{z}</b>
                <span>{text}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <section className="panel" data-reveal>
        <span className="panel__label">06 · Browser renders, backend resolves, database remembers</span>
        <div className="ukm__arch">
          {node('tiles', 'ukm__arch-tiles')}
          <span className="ukm__arrow ukm__arrow--tiles">↓</span>
          {node('browser', 'ukm__arch-browser')}
          <span className="ukm__arrow ukm__arrow--api">⇄</span>
          {node('api', 'ukm__arch-api')}
          <span className="ukm__arrow ukm__arrow--open">⇄</span>
          {node('open', 'ukm__arch-open')}
          <span className="ukm__arrow ukm__arrow--db">⇅</span>
          {node('db', 'ukm__arch-db')}
        </div>
      </section>

      <section className="panel" data-reveal>
        <span className="panel__label">07 · What broke, why, and how it was fixed</span>
        <div className="ukm__table">
          <div className="ukm__thead">
            <span>Problem</span>
            <span>Root cause</span>
            <span>Fix</span>
          </div>
          {UKMAP.challenges.map(([problem, cause, fix]) => (
            <div key={problem} className="ukm__tr">
              <strong>{problem}</strong>
              <span>{cause}</span>
              <span>{fix}</span>
            </div>
          ))}
        </div>
      </section>

      <div className="exp__bottom" data-reveal>
        <section className="panel">
          <span className="panel__label">08 · Large open datasets, loaded only where needed</span>
          <ul className="cs__impact">
            {UKMAP.data.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
        <section className="panel">
          <span className="panel__label">09 · Limits and next steps</span>
          <ul className="cs__impact">
            {UKMAP.limits.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
      </div>

      <p className="ukm__privacy" data-reveal>
        {UKMAP.privacy} Contains OS data © Crown copyright · HM Land Registry data © Crown copyright · FSA data under the Open Government
        Licence · © OpenStreetMap contributors.
      </p>

      {next}
    </div>
  )
}
