import { TABS } from '../data'
import type { ViewMode } from '../layout'

export const tabSlug = (title: string) =>
  title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

/** Path for a tab: /quick-label, or / when no tab is open. */
export const tabPath = (idx: number) => (TABS[idx] ? `/${tabSlug(TABS[idx].title)}` : '/')

/**
 * Which tab the address points at. Tabs live at real paths (/quick-label) so analytics
 * report them as separate pages; old #quick-label links still work.
 */
export const tabFromLocation = () => {
  const find = (slug: string) => (slug ? TABS.findIndex((t) => tabSlug(t.title) === slug) : -1)
  const fromPath = find(decodeURIComponent(location.pathname.replace(/^\/+|\/+$/g, '')))
  return fromPath !== -1 ? fromPath : find(decodeURIComponent(location.hash.slice(1)))
}

export type PlayingCard = { rank: string; suit: string }

const RANKS = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K']
const SUITS = ['♠', '♥', '♦', '♣']

/**
 * Deals every tab a different playing card at random (no jokers). About me is always the
 * King of Spades — in the cards view its preview shows a king instead of the portrait.
 */
export const dealHand = (): PlayingCard[] => {
  const deck = RANKS.flatMap((rank) => SUITS.map((suit) => ({ rank, suit })))
    .filter((c) => !(c.rank === 'K' && c.suit === '♠'))
    .sort(() => Math.random() - 0.5)
  return TABS.map((t, i) => (t.extra === 'about' ? { rank: 'K', suit: '♠' } : deck[i]))
}

// ---- localStorage, which can be blocked (private windows): never let it break anything ----
export const readStr = (key: string) => {
  try {
    return localStorage.getItem(key)
  } catch {
    return null
  }
}
export const writeStr = (key: string, value: string | null) => {
  try {
    if (value === null) localStorage.removeItem(key)
    else localStorage.setItem(key, value)
  } catch {
    // storage blocked: not remembered, nothing else breaks
  }
}
export const readList = (key: string): string[] => {
  try {
    const v = JSON.parse(readStr(key) ?? '[]')
    return Array.isArray(v) ? v.filter((x) => typeof x === 'string') : []
  } catch {
    return []
  }
}
export const writeList = (key: string, list: string[]) => writeStr(key, JSON.stringify(list))

export const VIEW_KEYS: ViewMode[] = ['stack', 'grid', 'cards', 'terminal']
/** The view the visitor last used, so a returning visitor starts where they left off. */
export const readView = (): ViewMode => {
  const v = readStr('view') as ViewMode | null
  return v && VIEW_KEYS.includes(v) ? v : 'stack'
}

/** The grid's saved tile order uses this key for the projects folder. */
export const FOLDER_KEY = '__folder'

export const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches
