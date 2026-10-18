import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { PORTAL } from './data'

const NISA = PORTAL.nisa
const MARK = { run: '›', ok: '✓', wait: '◷', stop: '■' } as const

/** Simplified Nisa automation run, printed line by line while `active`. */
export function RunLog({ active }: { active: boolean }) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const ctx = gsap.context(() => {
      if (!active || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        gsap.set('.run__line', { opacity: active ? 1 : 0 })
        return
      }
      gsap.fromTo('.run__line', { opacity: 0, x: -8 }, { opacity: 1, x: 0, duration: 0.35, stagger: 0.42, delay: 0.8, ease: 'power2.out' })
    }, el)
    return () => ctx.revert()
  }, [active])

  return (
    <div className="run" ref={ref} aria-label="Simplified automation run log">
      <div className="run__bar">
        <span />
        <span />
        <span />
        <em>automation-run.log</em>
      </div>
      <ol className="run__lines">
        {NISA.runLog.map(([kind, text]) => (
          <li key={text} className={`run__line run__line--${kind}`}>
            <span className="run__mark">{MARK[kind]}</span>
            {text}
          </li>
        ))}
        <li className="run__line run__line--cursor" aria-hidden>
          <span className="run__cursor" />
        </li>
      </ol>
      <a className="run__repo" href={`https://${NISA.demoRepo}`} target="_blank" rel="noreferrer">
        <span>
          <em>Public demo repository · not the production system</em>
          {NISA.demoRepo}
        </span>
        <b>↗</b>
      </a>
    </div>
  )
}
