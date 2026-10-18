import { useContext, type ReactNode } from 'react'
import { PORTAL, type PortalModule, type Tab } from './data'
import { Details, Flow, FullContext, ProjectSummary } from './ProjectParts'
import { LabelPrinter } from './LabelPrinter'
import { RunLog } from './RunLog'
import { MapArt, Slicing } from './CustomerMap'
import { useSeen } from './hooks/useSeen'

type Props = {
  tab: Tab
  /** true while the tab is open; each module's illustration starts once it scrolls into view */
  active: boolean
  meta: ReactNode
  next: ReactNode
}

const pad = (i: number) => String(i + 1).padStart(2, '0')
const SHOTS = '/assets/portal/'

/** A screenshot from the public rebuild; tall ones are cropped to the top and open in full. */
function Shot({ file, caption, tall }: { file: string; caption: string; tall?: boolean }) {
  return (
    <figure className={`pshot${tall ? ' pshot--tall' : ''}`}>
      <a href={SHOTS + file} target="_blank" rel="noreferrer" aria-label={`Open screenshot: ${caption}`}>
        <img src={SHOTS + file} alt={caption} loading="lazy" decoding="async" />
      </a>
      <figcaption>{caption}</figcaption>
    </figure>
  )
}

/** The animated illustration of a module, started when it comes into view. */
function ModuleArt({ id, active }: { id: PortalModule['id']; active: boolean }) {
  const [ref, on] = useSeen<HTMLDivElement>(active)
  return (
    <div ref={ref} className="pm__live">
      {id === 'map' && <MapArt active={on} />}
      {id === 'nisa' && <RunLog active={on} />}
      {id === 'labels' && (
        <div className="cs__art">
          <div className="media cs__image cs__image--art">
            <LabelPrinter active={on} title="Quick Label" repo={PORTAL.labels.repo} />
          </div>
          <p className="printer-note">The label links to the public rebuild; the production system is internal.</p>
        </div>
      )}
    </div>
  )
}

const ANIMATED: PortalModule['id'][] = ['map', 'labels', 'nisa']

function Module({ m, i, active }: { m: PortalModule; i: number; active: boolean }) {
  const animated = ANIMATED.includes(m.id)
  // modules without an animation lead with their first screenshot, and the second one sits
  // under the text instead of alone in a row
  const [lead, ...rest] = m.shots
  const below = animated ? m.shots : []
  return (
    <section className="pm" id={`pm-${m.id}`} aria-labelledby={`pm-${m.id}-name`}>
      <header className="pm__head">
        <span className="pm__num">Module {pad(i)}</span>
        <h3 className="pm__name" id={`pm-${m.id}-name`}>
          {m.name}
        </h3>
        <span className="pm__scope">My part · {m.scope}</span>
      </header>
      <div className="pm__body">
        <div className="pm__text">
          <p className="cs__text">
            <b>Problem.</b> {m.problem}
          </p>
          <div>
            <span className="panel__label">What I built</span>
            <ul className="cs__impact">
              {m.built.map((b) => (
                <li key={b}>{b}</li>
              ))}
            </ul>
          </div>
          <div>
            <span className="panel__label">How it holds up</span>
            <ul className="pm__notes">
              {m.notes.map((n) => (
                <li key={n}>{n}</li>
              ))}
            </ul>
          </div>
          {m.stats && (
            <ul className="pm__stats">
              {m.stats.map(([value, label]) => (
                <li key={label}>
                  <strong>{value}</strong>
                  <span>{label}</span>
                </li>
              ))}
            </ul>
          )}
          {!animated && rest.map(([file, caption]) => <Shot key={file} file={file} caption={caption} tall />)}
        </div>
        <div className="pm__art">
          {animated ? <ModuleArt id={m.id} active={active} /> : lead && <Shot file={lead[0]} caption={lead[1]} tall />}
        </div>
      </div>
      {below.length > 0 && (
        <div className="pm__shots">
          {below.map(([file, caption]) => (
            <Shot key={file} file={file} caption={caption} tall />
          ))}
        </div>
      )}
    </section>
  )
}

/** Wholesale Ops Portal: the portal, then every module inside it, each with its own illustration. */
export function PortalBody({ tab, active, meta, next }: Props) {
  // a closed tab is only a thumbnail: the modules (and their screenshots) wait until it's opened
  const full = useContext(FullContext)
  const map = PORTAL.map
  const tones = ['b', 's', 'p', 'n']
  const jump = (id: string) => document.getElementById(`pm-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })

  return (
    <div className="edu portal">
      <div className="edu__top">
        <div className="edu__intro">
          <h3 className="exp__headline" data-reveal>
            {PORTAL.subtitle}
          </h3>
          <p className="card__lead" data-reveal>
            {tab.description}
          </p>
          {meta}
        </div>
        <div className="portal__hero" data-reveal>
          <figure className="pshot">
            <img
              src={`${SHOTS}home.webp`}
              alt="The rebuild’s home page: each module’s live state and what needs a person today"
              decoding="async"
            />
            <figcaption>The rebuild’s home page shows each module’s live state and what needs a person today.</figcaption>
          </figure>
        </div>
      </div>

      <ProjectSummary summary={PORTAL.summary} />

      <section className="panel" data-reveal>
        <span className="panel__label">The problem</span>
        <div className="nisa__cols">
          {PORTAL.problem.map((p) => (
            <p key={p} className="cs__text">
              {p}
            </p>
          ))}
        </div>
        <nav className="portal__index" aria-label="Modules">
          {PORTAL.modules.map((m, i) => (
            <button key={m.id} type="button" onClick={() => jump(m.id)}>
              <em>{pad(i)}</em>
              {m.name}
            </button>
          ))}
        </nav>
        <p className="portal__note">{PORTAL.rebuildNote}</p>
      </section>

      {full && (
        <>
          {PORTAL.modules.map((m, i) => (
            <Module key={m.id} m={m} i={i} active={active} />
          ))}

          <section className="pm pm--shell">
            <header className="pm__head">
              <span className="pm__num">Shell</span>
              <h3 className="pm__name">One look across every module</h3>
              <span className="pm__scope">My part · Shared components</span>
            </header>
            <div className="pm__body">
              <p className="cs__text">{PORTAL.shell.text}</p>
              <div className="pm__shots pm__shots--shell">
                {PORTAL.shell.shots.map(([file, caption]) => (
                  <Shot key={file} file={file} caption={caption} />
                ))}
              </div>
            </div>
          </section>

          <div className="exp__bottom">
            <section className="panel">
              <span className="panel__label">Before</span>
              <ol className="ba ba--before">
                {PORTAL.before.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ol>
            </section>
            <section className="panel cs__dark">
              <span className="panel__label">After</span>
              <ol className="ba ba--after">
                {PORTAL.after.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ol>
            </section>
          </div>
          <p className="portal__note">This compares workflows, not measured savings.</p>

          <section className="panel">
            <span className="panel__label">My role</span>
            <div className="nisa__cols">
              {PORTAL.role.map((p) => (
                <p key={p} className="cs__text">
                  {p}
                </p>
              ))}
            </div>
          </section>
        </>
      )}

      <Details>
        <section className="panel">
          <span className="panel__label">01 · Architecture</span>
          <ol className="cs__arch">
            {PORTAL.architecture.map(([layer, text]) => (
              <li key={layer}>
                <strong>{layer}</strong>
                <span>{text}</span>
              </li>
            ))}
          </ol>
        </section>
        <section className="panel">
          <span className="panel__label">02 · Decisions that shaped it</span>
          <ul className="cs__features">
            {PORTAL.decisions.map(([title, text], i) => (
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
            <span className="panel__label">03 · Map: from messy address to one building</span>
            <ol className="ukm__steps">
              {map.pipeline.map(([title, text]) => (
                <li key={title}>
                  <strong>{title}</strong>
                  <span>{text}</span>
                </li>
              ))}
            </ol>
          </section>
          <section className="panel ukm__result">
            <span className="panel__label">Result · customer address precision</span>
            {map.precision.map(([label, parts]) => (
              <div key={label} className="ukm__bar-row">
                <span>{label}</span>
                <div className="ukm__bar">
                  {parts.map((v, k) => (
                    <i key={k} className={`ukm__seg ukm__seg--${tones[k]}`} style={{ width: `${v}%` }}>
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
              Most of the old misses had never really been searched: rate-limit errors were being saved as “not found”.
            </p>
          </section>
        </div>

        <section className="panel">
          <span className="panel__label">04 · Map: painting one shop, not the whole terrace</span>
          <div className="ukm__slicing">
            <div className="ukm__slicing-text">
              <p className="cs__text">
                OpenStreetMap often draws a row of terraced shops as one building, and vector tiles can merge them into one feature. The
                first version painted the whole feature, so picking one shop lit up a neighbourhood. The fix runs in the browser, on tile
                geometry:
              </p>
              <ul className="ukm__list">
                {map.slicing.map(([title, text]) => (
                  <li key={title}>
                    <strong>{title}.</strong> {text}
                  </li>
                ))}
              </ul>
            </div>
            <Slicing />
          </div>
        </section>

        <section className="panel">
          <span className="panel__label">05 · Map: what broke, why, and how it was fixed</span>
          <div className="ukm__table">
            <div className="ukm__thead">
              <span>Problem</span>
              <span>Root cause</span>
              <span>Fix</span>
            </div>
            {map.challenges.map(([problem, cause, fix]) => (
              <div key={problem} className="ukm__tr">
                <strong>{problem}</strong>
                <span>{cause}</span>
                <span>{fix}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="panel">
          <span className="panel__label">06 · Quick Label and Nisa: the workflows</span>
          {[...PORTAL.labels.flows, ...PORTAL.nisa.flows].map((flow, f) => (
            <div key={flow.label} className="cs__flow-row">
              <span className="cs__flow-label">{flow.label}</span>
              <Flow steps={flow.steps} main={f === 0 || f === 2} />
            </div>
          ))}
        </section>

        <section className="panel">
          <span className="panel__label">07 · Order processor: what a line difference turns into</span>
          <div className="ukm__table">
            <div className="ukm__thead">
              <span>Case</span>
              <span>When</span>
              <span>What the processor does</span>
            </div>
            {PORTAL.orderCases.map(([name, when, does]) => (
              <div key={name} className="ukm__tr">
                <strong>{name}</strong>
                <span>{when}</span>
                <span>{does}</span>
              </div>
            ))}
          </div>
        </section>

        <div className="exp__bottom">
          <section className="panel cs__dark">
            <span className="panel__label">08 · What I learned</span>
            <p className="cs__quote">{PORTAL.learned}</p>
          </section>
          <section className="panel">
            <span className="panel__label">09 · What I’d do next</span>
            <ul className="cs__impact">
              {PORTAL.next.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>
        </div>
      </Details>

      <a className="portal__repo" href={`https://${PORTAL.rebuild}`} target="_blank" rel="noreferrer" data-reveal>
        <span>
          <em>Public rebuild · fictional company, generated data</em>
          {PORTAL.rebuild}
        </span>
        <b aria-hidden>↗</b>
      </a>

      <p className="ukm__privacy" data-reveal>
        {PORTAL.privacy} Map data © OpenStreetMap contributors · Contains OS data © Crown copyright · HM Land Registry data © Crown
        copyright.
      </p>

      {next}
    </div>
  )
}
