import type { CSSProperties } from 'react'
import { INCOGNITO } from '../data'
import { Icon } from '../Icon'

/** Stack: the surprise tab once every tab has been closed. */
export function Incognito({ style }: { style: CSSProperties }) {
  return (
    <section className="incognito" style={style} aria-label="Incognito tab">
      <div className="incognito__bar">
        <Icon name="glasses" size={17} />
        {INCOGNITO.title}
      </div>
      <div className="incognito__body">
        <h2>{INCOGNITO.heading}</h2>
        <p className="incognito__lead">{INCOGNITO.lead}</p>
        <ul className="incognito__facts">
          {INCOGNITO.facts.map(([icon, title, text]) => (
            <li key={title}>
              <span className="incognito__icon">
                <Icon name={icon} size={20} />
              </span>
              <strong>{title}</strong>
              <p>{text}</p>
            </li>
          ))}
        </ul>
        <p className="incognito__hint">{INCOGNITO.hint}</p>
      </div>
    </section>
  )
}
