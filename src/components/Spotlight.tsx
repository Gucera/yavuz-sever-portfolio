import { useState } from 'react'
import { TABS } from '../data'
import { search } from '../search'

/** Search every tab; opened from the header's search button or the grid's dock. */
export function Spotlight({ onClose, onOpen }: { onClose: () => void; onOpen: (i: number) => void }) {
  const [query, setQuery] = useState('')
  const hits = search(query)
  const open = (i: number) => {
    onClose()
    onOpen(i)
  }
  return (
    <div className="spot" onClick={onClose}>
      <div className="spot__panel" onClick={(e) => e.stopPropagation()}>
        <input
          autoFocus
          className="spot__input"
          placeholder="Search tabs, projects, skills…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && hits[0]) open(hits[0].i)
          }}
        />
        <ul className="spot__results">
          {hits.map((h) => (
            <li key={h.i}>
              <button onClick={() => open(h.i)}>
                <i style={{ background: TABS[h.i].bg }} />
                <strong>{h.title}</strong>
                <span>{h.snippet}</span>
              </button>
            </li>
          ))}
          {query.trim().length >= 2 && hits.length === 0 && <li className="spot__empty">No results</li>}
        </ul>
      </div>
    </div>
  )
}
