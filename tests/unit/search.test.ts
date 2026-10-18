import { describe, expect, it } from 'vitest'
import { search } from '../../src/search'

describe('search', () => {
  it('needs at least two characters', () => {
    expect(search('')).toEqual([])
    expect(search('q')).toEqual([])
  })
  it('puts title matches first', () => {
    const hits = search('portal')
    expect(hits[0].title).toBe('Wholesale Ops Portal')
  })
  it('finds the modules that now live inside the portal tab', () => {
    for (const q of ['quick label', 'nisa automation', 'prospect map']) {
      expect(search(q).map((h) => h.title)).toContain('Wholesale Ops Portal')
    }
  })
  it('finds words inside a tab and returns a snippet around them', () => {
    const hits = search('playwright')
    expect(hits.length).toBeGreaterThan(0)
    expect(hits[0].snippet.toLowerCase()).toContain('playwright')
  })
})
