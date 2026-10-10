import { ABOUT, CANDY, CASE_STUDIES, DIMARK, EDUCATION, EXPERIENCE, NISA, TABS, UKMAP, type Tab } from './data'

/** Every piece of text a tab shows, for the Spotlight search. */
function textsOf(tab: Tab): string[] {
  const extra: Record<string, unknown> = {
    about: ABOUT,
    education: EDUCATION,
    experience: EXPERIENCE,
    case: CASE_STUDIES[tab.title],
    nisa: NISA,
    map: UKMAP,
    dimark: DIMARK,
    candy: CANDY,
  }
  const out: string[] = [tab.title, tab.kind, tab.description, ...tab.meta.map(([k, v]) => `${k}: ${v}`)]
  const walk = (v: unknown) => {
    if (typeof v === 'string') {
      if (!/^https?:|^github\.com|^\/assets/.test(v)) out.push(v)
    } else if (typeof v === 'number') out.push(String(v))
    else if (Array.isArray(v)) v.forEach(walk)
    else if (v && typeof v === 'object') Object.values(v).forEach(walk)
  }
  walk(tab.extra ? extra[tab.extra] : undefined)
  return out
}

const INDEX = TABS.map((tab, i) => ({ i, title: tab.title, texts: textsOf(tab) }))

export type SearchHit = { i: number; title: string; snippet: string }

/** Tabs matching the query: title hits first, each with a short snippet around the match. */
export function search(query: string, limit = 8): SearchHit[] {
  const q = query.trim().toLowerCase()
  if (q.length < 2) return []
  const hits: (SearchHit & { score: number })[] = []
  for (const { i, title, texts } of INDEX) {
    const text = texts.find((t) => t.toLowerCase().includes(q))
    if (!text) continue
    const at = text.toLowerCase().indexOf(q)
    const start = Math.max(0, at - 40)
    const snippet = (start ? '…' : '') + text.slice(start, at + q.length + 60) + (at + q.length + 60 < text.length ? '…' : '')
    hits.push({ i, title, snippet, score: title.toLowerCase().includes(q) ? 0 : 1 })
  }
  return hits.sort((a, b) => a.score - b.score).slice(0, limit)
}
