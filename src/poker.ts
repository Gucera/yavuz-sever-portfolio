export type PlayingCard = { rank: string; suit: string }

const VALUE: Record<string, number> = { A: 14, K: 13, Q: 12, J: 11, '10': 10, '9': 9, '8': 8, '7': 7, '6': 6, '5': 5, '4': 4, '3': 3, '2': 2 }

/** Highest card of a 5-long run in a set of values (A also counts low), or 0. */
function straightHigh(values: Set<number>) {
  const v = new Set(values)
  if (v.has(14)) v.add(1)
  for (let hi = 14; hi >= 5; hi--) {
    let ok = true
    for (let k = 0; k < 5; k++) if (!v.has(hi - k)) ok = false
    if (ok) return hi
  }
  return 0
}

/**
 * The best poker hand among the dealt cards, when it's worth celebrating (a straight or
 * better, roughly 1 deal in 10 with seven cards); otherwise null.
 */
export function bestHand(cards: PlayingCard[]): string | null {
  const bySuit = new Map<string, Set<number>>()
  const counts = new Map<number, number>()
  for (const c of cards) {
    const v = VALUE[c.rank]
    if (!bySuit.has(c.suit)) bySuit.set(c.suit, new Set())
    bySuit.get(c.suit)!.add(v)
    counts.set(v, (counts.get(v) ?? 0) + 1)
  }
  for (const vals of bySuit.values()) {
    if (vals.size < 5) continue
    const hi = straightHigh(vals)
    if (hi === 14) return 'Royal Flush'
    if (hi) return 'Straight Flush'
  }
  const freq = [...counts.values()].sort((a, b) => b - a)
  if (freq[0] === 4) return 'Four of a Kind'
  if (freq[0] === 3 && freq[1] >= 2) return 'Full House'
  if ([...bySuit.values()].some((s) => s.size >= 5)) return 'Flush'
  if (straightHigh(new Set(counts.keys()))) return 'Straight'
  return null
}
