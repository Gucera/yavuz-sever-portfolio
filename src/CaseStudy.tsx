import { Fragment, type ReactNode } from 'react'
import type { CaseStudy, Tab } from './data'
import { LabelPrinter } from './LabelPrinter'
import { Details, ProjectSummary } from './ProjectParts'

type Props = {
  tab: Tab
  study: CaseStudy
  /** true while the tab is open — starts the illustration */
  active: boolean
  meta: ReactNode
  next: ReactNode
}

const pad = (i: number) => String(i + 1).padStart(2, '0')

/** Project case study: hero, problem/solution, workflow, features, engineering, architecture, impact. */
export function CaseStudyBody({ tab, study, active, meta, next }: Props) {
  return (
    <div className="edu">
      <div className="edu__top">
        <div className="edu__intro">
          <h3 className="exp__headline" data-reveal>
            {study.subtitle}
          </h3>
          <p className="card__lead" data-reveal>
            {tab.description}
          </p>
          {meta}
        </div>
        {study.repo ? (
          <div className="cs__art" data-reveal>
            <div className="media cs__image cs__image--art">
              <LabelPrinter active={active} title={tab.title} repo={study.repo} />
            </div>
            <p className="printer-note">The label links to a public demo repository — the production system is internal.</p>
          </div>
        ) : (
          <div className="media cs__image" data-reveal>
            {tab.media[0]}
          </div>
        )}
      </div>

      <ProjectSummary summary={study.summary} />

      <div className="exp__bottom" data-reveal>
        <section className="panel">
          <span className="panel__label">01 · The problem</span>
          {study.problem.map((p) => (
            <p key={p} className="cs__text">
              {p}
            </p>
          ))}
        </section>
        <section className="panel">
          <span className="panel__label">02 · The solution</span>
          {study.solution.map((p) => (
            <p key={p} className="cs__text">
              {p}
            </p>
          ))}
        </section>
      </div>

      <Details>
      <section className="panel cs__dark">
        <span className="panel__label">03 · Core workflow</span>
        {study.flows.map((flow, f) => (
          <div key={flow.label} className="cs__flow-row">
            <span className="cs__flow-label">{flow.label}</span>
            <ol className={`cs__flow${f === 0 ? ' cs__flow--main' : ''}`}>
              {flow.steps.map((step, i) => (
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
          </div>
        ))}
      </section>

      <section className="panel">
        <span className="panel__label">04 · Key features</span>
        <ul className="cs__features">
          {study.features.map(([title, text], i) => (
            <li key={title}>
              <span className="exp__num">{pad(i)}</span>
              <h3>{title}</h3>
              <p>{text}</p>
            </li>
          ))}
        </ul>
      </section>

      <div className="exp__bottom">
        <section className="panel cs__dark">
          <span className="panel__label">05 · Engineering challenge</span>
          <p className="cs__quote">{study.challenge[0]}</p>
          {study.challenge.slice(1).map((p) => (
            <p key={p} className="cs__text">
              {p}
            </p>
          ))}
        </section>
        <section className="panel">
          <span className="panel__label">06 · Reliability & safety</span>
          <p className="cs__quote">{study.safety[0]}</p>
          {study.safety.slice(1).map((p) => (
            <p key={p} className="cs__text">
              {p}
            </p>
          ))}
        </section>
      </div>

      <div className="exp__bottom">
        <section className="panel">
          <span className="panel__label">07 · Architecture</span>
          <ol className="cs__arch">
            {study.architecture.map(([layer, text]) => (
              <li key={layer}>
                <strong>{layer}</strong>
                <span>{text}</span>
              </li>
            ))}
          </ol>
        </section>
        <section className="panel">
          <span className="panel__label">08 · Impact</span>
          <ul className="cs__impact">
            {study.impact.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
      </div>

      <section className="panel">
        <span className="panel__label">09 · What I learned</span>
        <p className="cs__learned">{study.learned}</p>
      </section>
      </Details>

      {next}
    </div>
  )
}
