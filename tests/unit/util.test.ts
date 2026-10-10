import { describe, expect, it } from 'vitest'
import { dealHand, tabSlug } from '../../src/app/util'
import { TABS } from '../../src/data'

describe('tabSlug', () => {
  it('turns titles into clean paths', () => {
    expect(tabSlug('UK Customer Map')).toBe('uk-customer-map')
    expect(tabSlug('About me')).toBe('about-me')
    expect(tabSlug('  Quick Label! ')).toBe('quick-label')
  })
  it('gives every tab a different path', () => {
    const slugs = TABS.map((t) => tabSlug(t.title))
    expect(new Set(slugs).size).toBe(TABS.length)
  })
})

describe('dealHand', () => {
  it('always deals About me the King of Spades', () => {
    for (let k = 0; k < 20; k++) {
      const hand = dealHand()
      const about = TABS.findIndex((t) => t.extra === 'about')
      expect(hand[about]).toEqual({ rank: 'K', suit: '♠' })
    }
  })
  it('never deals the same card twice', () => {
    for (let k = 0; k < 50; k++) {
      const keys = dealHand().map((c) => c.rank + c.suit)
      expect(new Set(keys).size).toBe(TABS.length)
    }
  })
})
