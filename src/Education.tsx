import type { ReactNode } from 'react'
import { EDUCATION, type Tab } from './data'
import { UelBadge } from './UelBadge'

const { highlight, marks, areas } = EDUCATION

type Props = {
  tab: Tab
  /** true while the tab is open — drives the module bars */
  active: boolean
  meta: ReactNode
  next: ReactNode
}

/** Education tab: intro + crest on top, three aligned panels below. */
export function EducationBody({ tab, active, meta, next }: Props) {
  return (
    <div className="edu">
      <div className="edu__top">
        <div className="edu__intro">
          <p className="card__lead" data-reveal>
            {tab.description}
          </p>
          {meta}
        </div>
        <div className="media media--3d edu__badge" data-reveal>
          <UelBadge bg={tab.bg} face={tab.ink} side="#2a0f8f" rim="#c6ff3d" />
        </div>
      </div>

      <div className="edu__grid" data-reveal>
        <section className="panel edu__highlight">
          <span className="panel__label">Academic highlight</span>
          <div className="edu__grade">{highlight.value}</div>
          <div className="edu__honours">
            <strong>{highlight.label}</strong>
            <span>{highlight.note}</span>
          </div>
        </section>

        <section className="panel">
          <span className="panel__label">Top modules</span>
          <ul className="edu__marks">
            {marks.map(([name, mark], i) => (
              <li key={name}>
                <div className="edu__mark-head">
                  <span>{name}</span>
                  <span>{mark}</span>
                </div>
                <div className="edu__bar">
                  <span
                    style={{
                      width: active ? `${mark}%` : '0%',
                      transitionDelay: active ? `${0.6 + i * 0.08}s` : '0s',
                    }}
                  />
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section className="panel">
          <span className="panel__label">Key areas of study</span>
          <ul className="edu__areas">
            {areas.map((area, i) => (
              <li key={area}>
                <span className="edu__area-num">{String(i + 1).padStart(2, '0')}</span>
                {area}
              </li>
            ))}
          </ul>
        </section>
      </div>

      {next}
    </div>
  )
}
