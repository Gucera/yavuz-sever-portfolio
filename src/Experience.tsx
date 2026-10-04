import type { ReactNode } from 'react'
import { EXPERIENCE, type Tab } from './data'

const { story, focus, stack, spans, work } = EXPERIENCE

type Props = {
  tab: Tab
  meta: ReactNode
  next: ReactNode
}

/** Experience tab: story + role on top, focus areas, then stack and work. */
export function ExperienceBody({ tab, meta, next }: Props) {
  return (
    <div className="edu">
      <div className="edu__top">
        <div className="edu__intro">
          <h3 className="exp__headline" data-reveal>
            {tab.description}
          </h3>
          <div className="exp__story" data-reveal>
            {story.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </div>
          {meta}
        </div>
        <div className="media exp__photo" data-reveal>
          <img className="exp__logo" src="/assets/dimark-logo.webp" alt="Dimark Limited" width={1657} height={949} />
        </div>
      </div>

      <section className="panel" data-reveal>
        <span className="panel__label">What I focus on</span>
        <ul className="exp__focus">
          {focus.map(([title, text], i) => (
            <li key={title}>
              <span className="exp__num">{String(i + 1).padStart(2, '0')}</span>
              <h3>{title}</h3>
              <p>{text}</p>
            </li>
          ))}
        </ul>
      </section>

      <div className="exp__bottom" data-reveal>
        <section className="panel">
          <span className="panel__label">Stack</span>
          <ul className="exp__stack">
            {stack.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>
          <p className="exp__spans">{spans}</p>
        </section>

        <section className="panel exp__work">
          <span className="panel__label">The work</span>
          {work.map((p) => (
            <p key={p}>{p}</p>
          ))}
        </section>
      </div>

      {next}
    </div>
  )
}
