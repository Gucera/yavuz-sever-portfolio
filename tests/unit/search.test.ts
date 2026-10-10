import { describe, expect, it } from 'vitest'
import { search } from '../../src/search'

describe('search', () => {
  it('needs at least two characters', () => {
    expect(search('')).toEqual([])
    expect(search('q')).toEqual([])
  })
  it('puts title matches first', () => {
    const hits = search('label')
    expect(hits[0].title).toBe('Quick Label')
  })
  it('finds words inside a tab and returns a snippet around them', () => {
    const hits = search('playwright')
    expect(hits.length).toBeGreaterThan(0)
    expect(hits[0].snippet.toLowerCase()).toContain('playwright')
  })
})
