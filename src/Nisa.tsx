import { Fragment, useEffect, useRef, type ReactNode } from 'react'
import gsap from 'gsap'
import { NISA, type Tab } from './data'

type Props = {
  tab: Tab
  /** true while the tab is open — plays the run log */
  active: boolean
  meta: ReactNode
  next: ReactNode
}

const pad = (i: number) => String(i + 1).padStart(2, '0')
const MARK = { run: '›', ok: '✓', wait: '◷', stop: '■' } as const

/** Simplified automation run, printed line by line. */
function RunLog({ active }: { active: boolean }) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const ctx = gsap.context(() => {
      if (!active || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        gsap.set('.run__line', { opacity: active ? 1 : 0 })
        return
      }
      gsap.fromTo('.run__line', { opacity: 0, x: -8 }, { opacity: 1, x: 0, duration: 0.35, stagger: 0.42, delay: 0.8, ease: 'power2.out' })
    }, el)
    return () => ctx.revert()
  }, [active])

  return (
    <div className="run" ref={ref} aria-label="Simplified automation run log">
      <div className="run__bar">
        <span />
        <span />
        <span />
        <em>automation-run.log</em>
      </div>
      <ol className="run__lines">
        {NISA.runLog.map(([kind, text]) => (
          <li key={text} className={`run__line run__line--${kind}`}>
            <span className="run__mark">{MARK[kind]}</span>
            {text}
          </li>
        ))}
        <li className="run__line run__line--cursor" aria-hidden>
          <span className="run__cursor" />
        </li>
      </ol>
      <a className="run__repo" href={`https://${NISA.demoRepo}`} target="_blank" rel="noreferrer">
        <span>
          <em>Public demo repository · not the production system</em>
          {NISA.demoRepo}
        </span>
        <b>↗</b>
      </a>
    </div>
  )
}

function Flow({ steps, main }: { steps: string[]; main?: boolean }) {
  return (
    <ol className={`cs__flow${main ? ' cs__flow--main' : ''}`}>
      {steps.map((step, i) => (
        <Fragment key={step}>
          {i > 0 && (
            <li className="cs__arrow" aria-hidden>
              →
            </li>
          )}
          <li className="cs__node">{step}</li>
        </Fragment>
      ))}
    </ol>
  )
}

/** Nisa Automation: system / flow oriented case study. */
export function NisaBody({ tab, active, meta, next }: Props) {
  const a = NISA.architecture
  const node = (key: string) => (
    <div className={`arch__node arch__node--${key}`}>
      <strong>{a[key][0]}</strong>
      <span>{a[key][1]}</span>
    </div>
  )

  return (
    <div className="edu nisa">
      <div className="edu__top">
        <div className="edu__intro">
          <h3 className="exp__headline" data-reveal>
            {NISA.subtitle}
          </h3>
          <p className="card__lead" data-reveal>
            {tab.description}
          </p>
          {meta}
        </div>
        <div data-reveal>
          <RunLog active={active} />
        </div>
      </div>

      <section className="panel" data-reveal>
        <span className="panel__label">01 · The problem</span>
        <div className="nisa__cols">
          {NISA.problem.map((p) => (
            <p key={p} className="cs__text">
              {p}
            </p>
          ))}
        </div>
      </section>

      <div className="exp__bottom" data-reveal>
        <section className="panel">
          <span className="panel__label">02 · Before</span>
          <ol className="ba ba--before">
            {NISA.before.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ol>
        </section>
        <section className="panel cs__dark">
          <span className="panel__label">After</span>
          <ol className="ba ba--after">
            {NISA.after.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ol>
        </section>
      </div>

      <section className="panel" data-reveal>
        <span className="panel__label">03 · Two workflows</span>
        {NISA.flows.map((flow, f) => (
          <div key={flow.label} className="cs__flow-row">
            <span className="cs__flow-label">{flow.label}</span>
            <Flow steps={flow.steps} main={f === 0} />
          </div>
        ))}
      </section>

      <section className="panel" data-reveal>
        <span className="panel__label">04 · Technical architecture</span>
        <div className="arch">
          <div className="arch__node arch__node--op">
            <strong>Operator</strong>
            <span>Selects and approves</span>
          </div>
          <span className="arch__arrow">→</span>
          {node('frontend')}
          <span className="arch__arrow">→</span>
          {node('backend')}
          <span className="arch__arrow">⇄</span>
          {node('worker')}
          <span className="arch__arrow">→</span>
          <div className="arch__node arch__node--ext">
            <strong>Supplier Portal</strong>
            <span>Third-party, no API</span>
          </div>
          <span className="arch__down arch__down--events">↑</span>
          <span className="arch__down arch__down--data">↓</span>
          {node('events')}
          {node('data')}
        </div>
      </section>

      <section className="panel" data-reveal>
        <span className="panel__label">05 · Core engineering principles</span>
        <ul className="cs__features nisa__principles">
          {NISA.principles.map(([title, text], i) => (
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
          <span className="panel__label">06 · The hardest challenge</span>
          <p className="cs__quote">{NISA.challenge[0]}</p>
          {NISA.challenge.slice(1).map((p) => (
            <p key={p} className="cs__text">
              {p}
            </p>
          ))}
        </section>
        <section className="panel cs__dark">
          <span className="panel__label">07 · Reliability & safety</span>
          {NISA.safety.map((p) => (
            <p key={p} className="cs__text">
              {p}
            </p>
          ))}
          <p className="cs__quote">{NISA.safetyLine}</p>
        </section>
      </div>

      <div className="exp__bottom" data-reveal>
        <section className="panel">
          <span className="panel__label">08 · Impact</span>
          <ul className="cs__impact">
            {NISA.impact.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
        <section className="panel">
          <span className="panel__label">09 · What I learned</span>
          {NISA.learned.map((p) => (
            <p key={p} className="cs__text">
              {p}
            </p>
          ))}
        </section>
      </div>

      {next}
    </div>
  )
}
