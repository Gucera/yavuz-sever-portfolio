import { useRef, type PointerEvent } from 'react'
import gsap from 'gsap'
import { PROFILE } from '../data'
import { Icon } from '../Icon'

/**
 * Grid view: the dock. macOS-style magnification: every icon grows by how close the pointer
 * is to it, so the neighbours swell too and the row parts smoothly.
 */
export function Dock({ onSearch, onEmail }: { onSearch: () => void; onEmail: () => void }) {
  const ref = useRef<HTMLElement>(null)
  const magnify = (e: PointerEvent) => {
    const dock = ref.current
    if (!dock || e.pointerType !== 'mouse') return
    const items = [...dock.children] as HTMLElement[]
    const base = 52
    const gap = parseFloat(getComputedStyle(dock).columnGap) || 0
    const r = dock.getBoundingClientRect()
    const left = r.left + r.width / 2 - (items.length * base + (items.length - 1) * gap) / 2
    items.forEach((it, k) => {
      const d = Math.abs(e.clientX - (left + k * (base + gap) + base / 2)) / (base * 2.6)
      const m = d >= 1 ? 0 : Math.cos((d * Math.PI) / 2)
      gsap.to(it, { '--m': m, duration: 0.2, ease: 'power2.out', overwrite: true })
    })
  }
  const unmagnify = () => {
    const items = ref.current ? [...ref.current.children] : []
    gsap.to(items, { '--m': 0, duration: 0.45, ease: 'power3.out', overwrite: true })
  }
  return (
    <nav className="dock" aria-label="Links" ref={ref} onPointerMove={magnify} onPointerLeave={unmagnify}>
      <a className="dock__item dock__item--gh" href={PROFILE.socials[0][1]} target="_blank" rel="noreferrer" aria-label="GitHub">
        <Icon name="github" size={24} />
      </a>
      <a className="dock__item dock__item--in" href={PROFILE.socials[1][1]} target="_blank" rel="noreferrer" aria-label="LinkedIn">
        <Icon name="linkedin" size={22} />
      </a>
      <a className="dock__item dock__item--ig" href={PROFILE.socials[2][1]} target="_blank" rel="noreferrer" aria-label="Instagram">
        <Icon name="instagram" size={24} />
      </a>
      <a
        className="dock__item dock__item--mail"
        href={`mailto:${PROFILE.email}`}
        aria-label="Copy email"
        onClick={(e) => {
          e.preventDefault()
          onEmail()
        }}
      >
        <Icon name="mail" size={24} />
      </a>
      <a className="dock__item dock__item--cv" href={PROFILE.cv} download aria-label="Download CV">
        <Icon name="file" size={24} />
      </a>
      <button className="dock__item dock__item--search" aria-label="Search" onClick={onSearch}>
        <Icon name="search" size={24} />
      </button>
    </nav>
  )
}
