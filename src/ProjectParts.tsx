import { createContext, useContext, useState, type ReactNode } from 'react'
import { Icon } from './Icon'

/**
 * false while a tab is only a thumbnail (stack, grid, cards) and has never been opened: the
 * long parts of the page aren't rendered at all until the visitor opens it.
 */
export const FullContext = createContext(true)

export type Summary = {
  problem: string
  built: string
  result: string
  /** the project's numbers, shown once here and nowhere else on the page */
  stats?: [value: string, label: string][]
}

/** The 30-second version of a project, at the top of its tab. */
export function ProjectSummary({ summary }: { summary: Summary }) {
  return (
    <section className="summary" data-reveal aria-label="Project summary">
      <dl className="summary__rows">
        <div>
          <dt>Problem</dt>
          <dd>{summary.problem}</dd>
        </div>
        <div>
          <dt>What I built</dt>
          <dd>{summary.built}</dd>
        </div>
        <div>
          <dt>Result</dt>
          <dd>{summary.result}</dd>
        </div>
      </dl>
      {summary.stats && summary.stats.length > 0 && (
        <ul className="summary__stats">
          {summary.stats.map(([value, label]) => (
            <li key={label}>
              <strong>{value}</strong>
              <span>{label}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

/**
 * The long technical sections, folded away under one button. Its content is only rendered
 * once it's opened (and never for a thumbnail).
 */
export function Details({ children, label = 'Technical details' }: { children: ReactNode; label?: string }) {
  const full = useContext(FullContext)
  const [open, setOpen] = useState(false)
  if (!full) return null
  return (
    <div className={`more${open ? ' is-open' : ''}`}>
      <button type="button" className="more__toggle" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
        <span>{open ? 'Hide' : 'Show'} {label.toLowerCase()}</span>
        <Icon name="chevronDown" size={16} className="more__chev" />
      </button>
      {open && <div className="more__body">{children}</div>}
    </div>
  )
}
