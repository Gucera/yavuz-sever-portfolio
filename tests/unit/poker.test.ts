import { describe, expect, it } from 'vitest'
import { bestHand } from '../../src/poker'

const c = (s: string) => s.split(' ').map((x) => ({ rank: x.slice(0, -1), suit: x.slice(-1) }))

describe('bestHand', () => {
  it('spots a royal flush', () => {
    expect(bestHand(c('A♠ K♠ Q♠ J♠ 10♠ 2♥ 3♦'))).toBe('Royal Flush')
  })
  it('spots a straight flush', () => {
    expect(bestHand(c('9♥ 8♥ 7♥ 6♥ 5♥ K♠ 2♦'))).toBe('Straight Flush')
  })
  it('spots four of a kind and a full house', () => {
    expect(bestHand(c('7♠ 7♥ 7♦ 7♣ 2♠ 3♥ 9♦'))).toBe('Four of a Kind')
    expect(bestHand(c('Q♠ Q♥ Q♦ 4♣ 4♠ 9♥ 2♦'))).toBe('Full House')
  })
  it('spots a flush and a straight (ace low too)', () => {
    expect(bestHand(c('2♣ 6♣ 9♣ J♣ K♣ 3♥ 4♦'))).toBe('Flush')
    expect(bestHand(c('A♠ 2♥ 3♦ 4♣ 5♠ 9♥ K♦'))).toBe('Straight')
  })
  it('ignores anything weaker than a straight', () => {
    expect(bestHand(c('A♠ A♥ K♦ K♣ 5♠ 9♥ 2♦'))).toBeNull()
  })
})
