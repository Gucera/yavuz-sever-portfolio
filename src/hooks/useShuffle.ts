import { useState, type MutableRefObject } from 'react'
import { flushSync } from 'react-dom'
import gsap from 'gsap'
import type { Viewport } from '../layout'
import { dealHand, reducedMotion, type PlayingCard } from '../app/util'

type Args = {
  vp: Viewport
  visible: number[]
  dealing: number
  cardRefs: MutableRefObject<(HTMLDivElement | null)[]>
  setPicked: (i: number) => void
  setHoverIdx: (i: number) => void
  setOnTable: (t: number[]) => void
  setFlipped: (f: number[]) => void
  setHand: (h: PlayingCard[]) => void
}

/**
 * Cards view: a dealer's riffle shuffle. The cards gather face down into a tidy deck, the
 * deck is cut into two halves, the halves riffle back together card by card, the deck is
 * squared up and the new hand is spread back out into the fan, each card turning face up.
 * Driven by the individual translate/rotate/scale properties so it never fights the layout
 * transform React writes.
 */
export function useShuffle({ vp, visible, dealing, cardRefs, setPicked, setHoverIdx, setOnTable, setFlipped, setHand }: Args) {
  const [shuffling, setShuffling] = useState(false)

  const shuffle = () => {
    if (shuffling || dealing !== -1) return
    setPicked(-1)
    setHoverIdx(-1)
    if (reducedMotion()) {
      setOnTable([])
      setFlipped([])
      setHand(dealHand())
      return
    }
    setShuffling(true)
    setFlipped([]) // faces are turned by the data-facedown attribute below, without re-rendering
    const ids = visible.filter((i) => cardRefs.current[i])
    const els = ids.map((i) => cardRefs.current[i]!)
    const n = els.length
    const deck = { x: vp.w / 2, y: vp.h * (vp.mobile ? 0.58 : 0.6) }
    const S = 0.82 // the deck is a little smaller than the fanned hand
    const centre = (el: HTMLElement) => ({
      x: (parseFloat(el.style.left) || 0) + (parseFloat(el.style.width) || 0) / 2,
      y: (parseFloat(el.style.top) || 0) + (parseFloat(el.style.height) || 0) / 2,
    })
    const cw = (parseFloat(els[0]?.style.width ?? '') || 200) * S
    const thick = vp.mobile ? 1.2 : 1.6 // px between cards in the pile, so it reads as a deck
    const st = els.map((el, k) => {
      const c = centre(el)
      // g: how far into the deck (0 = in the hand, 1 = on the pile); dx/dy: offset on the pile
      // fa: the card's fan angle, cancelled on the pile so the deck sits square
      const fa = parseFloat(el.style.getPropertyValue('--fa')) || 0
      return { g: 0, dx: 0, dy: -k * thick, r: 0, sx: 1, s: 1, fa, ox: deck.x - c.x, oy: deck.y - c.y }
    })
    const draw = (k: number) => {
      const el = els[k]
      const p = st[k]
      el.style.translate = `${p.ox * p.g + p.dx}px ${p.oy * p.g + p.dy * p.g}px`
      el.style.rotate = `${p.r - p.fa * p.g}deg`
      el.style.scale = `${p.sx * p.s} ${p.s}`
    }
    // stacking during the shuffle goes through its own --sz, so React's --hz is never overwritten
    const z = (k: number, v: number) => els[k].style.setProperty('--sz', String(v))
    const tl = gsap.timeline({
      defaults: { overwrite: false },
      onComplete: () => {
        els.forEach((el) => {
          delete el.dataset.facedown
          el.style.translate = ''
          el.style.rotate = ''
          el.style.scale = ''
          el.style.removeProperty('--sz')
        })
        setShuffling(false)
      },
    })

    // 1. gather: the hand sweeps into one neat deck, each card turning face down on the way
    els.forEach((_, k) => {
      const at = (n - 1 - k) * 0.035 // right to left, like scooping up a spread
      tl.call(() => z(k, 30 + k), undefined, at)
      tl.to(st[k], { g: 1, s: S, duration: 0.55, ease: 'power3.inOut', onUpdate: () => draw(k) }, at)
      tl.to(st[k], { keyframes: { sx: [1, 0.02, 1] }, duration: 0.26, ease: 'none', onUpdate: () => draw(k) }, at + 0.12)
      tl.call(() => (els[k].dataset.facedown = '1'), undefined, at + 0.25)
    })
    // the deck is together: cards on the table rejoin the hand, out of sight in the pile
    tl.call(() => {
      flushSync(() => setOnTable([]))
      els.forEach((el, k) => {
        const c = centre(el)
        st[k].ox = deck.x - c.x
        st[k].oy = deck.y - c.y
        st[k].fa = parseFloat(el.style.getPropertyValue('--fa')) || 0
        draw(k)
      })
    })

    // 2. cut: the bottom half slides left, the top half right, both tipping in towards the middle
    const half = Math.ceil(n / 2)
    const cut = tl.duration() + 0.08
    els.forEach((_, k) => {
      const left = k < half
      const pos = left ? k : k - half
      tl.to(
        st[k],
        { dx: (left ? -1 : 1) * cw * 0.62, dy: -pos * thick, r: left ? 7 : -7, duration: 0.38, ease: 'power2.inOut', onUpdate: () => draw(k) },
        cut + (left ? 0 : 0.04),
      )
    })

    // 3. riffle: the halves bend in and drop their cards alternately onto one pile in the middle
    const order: number[] = []
    for (let p = 0; p < half; p++) {
      order.push(p) // left half
      if (half + p < n) order.push(half + p) // right half
    }
    const riffle = tl.duration() + 0.06
    order.forEach((k, j) => {
      const at = riffle + j * 0.065
      tl.call(() => z(k, 60 + j), undefined, at)
      tl.to(
        st[k],
        {
          keyframes: { dy: [-(k < half ? k : k - half) * thick, -j * thick - 10, -j * thick], easeEach: 'sine.inOut' },
          dx: (j % 2 ? 1 : -1) * 2,
          r: (j % 2 ? -1 : 1) * 1.2,
          duration: 0.24,
          ease: 'power2.in',
          onUpdate: () => draw(k),
        },
        at,
      )
    })
    // a fresh hand while the deck is face down
    tl.call(() => setHand(dealHand()))

    // 4. square up: a quick tap that straightens the pile
    const square = tl.duration() + 0.05
    els.forEach((_, k) => tl.to(st[k], { dx: 0, r: 0, duration: 0.18, ease: 'power2.out', onUpdate: () => draw(k) }, square))
    tl.to({}, { duration: 0.12 })

    // 5. spread: the hand fans back out from the deck, left to right, each card turning face up
    const spread = tl.duration()
    els.forEach((_, k) => {
      const at = spread + k * 0.06
      tl.call(() => z(k, 90 + n - k), undefined, at) // already in the hand's overlap order: About me on top
      tl.to(st[k], { g: 0, s: 1, duration: 0.6, ease: 'power3.out', onUpdate: () => draw(k) }, at)
      tl.to(st[k], { keyframes: { sx: [1, 0.02, 1] }, duration: 0.26, ease: 'none', onUpdate: () => draw(k) }, at + 0.08)
      tl.call(() => delete els[k].dataset.facedown, undefined, at + 0.21)
    })
  }

  return { shuffling, shuffle }
}
