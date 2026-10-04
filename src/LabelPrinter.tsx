import { useEffect, useRef } from 'react'
import gsap from 'gsap'

type Props = {
  /** starts the print animation */
  active: boolean
  title: string
  /** repository link without protocol, e.g. github.com/user/repo */
  repo: string
}

// Deterministic barcode bars so the label looks the same on every render.
const BARS = (() => {
  const bars: [number, number][] = []
  let x = 0
  let seed = 7
  const rnd = () => (seed = (seed * 9301 + 49297) % 233280) / 233280
  while (x < 174) {
    const w = 1 + Math.floor(rnd() * 3)
    bars.push([x, w])
    x += w + 1 + Math.floor(rnd() * 2.5)
  }
  return bars
})()

/** Industrial thermal label printer that prints a label carrying the repo link. */
export function LabelPrinter({ active, title, repo }: Props) {
  const rootRef = useRef<SVGSVGElement>(null)
  const slash = repo.indexOf('/')
  const host = repo.slice(0, slash + 1)
  const path = repo.slice(slash + 1)

  useEffect(() => {
    const root = rootRef.current
    if (!root) return
    const ctx = gsap.context(() => {
      const status = root.querySelector<SVGTextElement>('.printer__status')!
      const count = root.querySelector<SVGTextElement>('.printer__count')!
      const hidden = { y: -220 }

      if (!active) {
        gsap.set('.printer__label', hidden)
        gsap.set('.printer__progress', { attr: { width: 0 } })
        status.textContent = 'READY'
        count.textContent = '0 / 1'
        return
      }

      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        gsap.set('.printer__label', { y: 0 })
        gsap.set('.printer__progress', { attr: { width: 60 } })
        status.textContent = 'DONE'
        count.textContent = '1 / 1'
        return
      }

      const progress = { p: 0 }
      gsap
        .timeline({ delay: 0.7 })
        .set('.printer__label', hidden)
        .call(() => {
          status.textContent = 'PRINTING…'
        })
        .to('.printer__led', { opacity: 0.2, duration: 0.25, repeat: 9, yoyo: true, ease: 'none' }, 0)
        .to('.printer__fx', { opacity: 1, duration: 0.2, repeat: 11, yoyo: true, ease: 'none' }, 0.15)
        .set('.printer__fx', { opacity: 0 }, 2.75)
        .to('.printer__label', { y: 0, duration: 2.6, ease: 'power1.inOut' }, 0.15)
        .to('.printer__progress', { attr: { width: 60 }, duration: 2.6, ease: 'power1.inOut' }, 0.15)
        .to(
          progress,
          {
            p: 100,
            duration: 2.6,
            ease: 'power1.inOut',
            onUpdate: () => {
              count.textContent = `${Math.round(progress.p)}%`
            },
          },
          0.15,
        )
        .call(() => {
          status.textContent = 'DONE'
          count.textContent = '1 / 1'
        })
        .to('.printer__label', { rotation: 1.5, transformOrigin: '50% 0%', duration: 0.5, ease: 'sine.out' })
        .to('.printer__label', { rotation: 0, duration: 1.2, ease: 'elastic.out(1, 0.4)' })
    }, root)
    return () => ctx.revert()
  }, [active])

  return (
    <svg
      ref={rootRef}
      className="printer"
      viewBox="95 52 480 428"
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label={`Label printer printing a ${title} label linking to the public demo repository ${repo}`}
    >
      <defs>
        <pattern id="pr-hatch" width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(-30)">
          <rect width="7" height="7" fill="#e4dfd2" />
          <line x1="0" y1="0" x2="0" y2="7" stroke="#111" strokeWidth="1.2" />
        </pattern>
        <pattern id="pr-grille" width="7" height="7" patternUnits="userSpaceOnUse">
          <circle cx="3.5" cy="3.5" r="1.3" fill="#111" />
        </pattern>
        <clipPath id="pr-out">
          <rect x="0" y="268" width="700" height="220" />
        </clipPath>
      </defs>

      <g stroke="#111" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round">
        {/* ground shadow, flat like ink */}
        <ellipse cx="335" cy="380" rx="236" ry="9" fill="rgba(0,0,0,.18)" stroke="none" />

        {/* top: lid seam + grip recess */}
        <polygon points="110,110 190,70 560,70 480,110" fill="#fffdf6" />
        <line x1="238" y1="110" x2="318" y2="70" strokeWidth="2" />
        <polygon points="372,96 404,80 448,80 416,96" fill="#ebe7db" strokeWidth="2" />

        {/* side: hatch, ruler window, vents */}
        <polygon points="480,110 560,70 560,330 480,370" fill="url(#pr-hatch)" />
        <polygon points="500,170 542,149 542,222 500,243" fill="#fffdf6" strokeWidth="2.5" />
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <line key={i} x1={506 + i * 6} y1={186 - i * 3} x2={506 + i * 6} y2={(i % 2 ? 192 : 196) - i * 3} strokeWidth="1.5" />
        ))}
        {[0, 1, 2, 3].map((i) => (
          <line key={i} x1="494" y1={300 + i * 11} x2="546" y2={274 + i * 11} strokeWidth="2.5" />
        ))}

        {/* front + inner bevel + screws */}
        <rect x="110" y="110" width="370" height="260" rx="10" fill="#fffdf6" />
        <rect x="117" y="117" width="356" height="246" rx="7" fill="none" strokeWidth="1.2" />
        {[[468, 124], [468, 356], [250, 356]].map(([cx, cy]) => (
          <g key={cx + '-' + cy} strokeWidth="1.5">
            <circle cx={cx} cy={cy} r="3.5" fill="#ebe7db" />
            <line x1={cx - 2} y1={cy} x2={cx + 2} y2={cy} />
          </g>
        ))}
        <rect x="128" y="370" width="24" height="9" rx="2" fill="#111" />
        <rect x="438" y="370" width="24" height="9" rx="2" fill="#111" />

        {/* control panel */}
        <rect x="122" y="122" width="104" height="236" rx="7" fill="#ebe7db" strokeWidth="2.5" />
        <rect x="134" y="136" width="80" height="104" rx="5" fill="#111" strokeWidth="2.5" />
        {[140, 164, 188].map((x) => (
          <rect key={x} x={x} y="258" width="20" height="16" rx="3" fill="#fffdf6" strokeWidth="2" />
        ))}
        <g strokeWidth="1.8">
          <line x1="147" y1="262" x2="147" y2="270" />
          <line x1="153" y1="262" x2="153" y2="270" />
          <polygon points="170,262 179,266 170,270" fill="#111" strokeWidth="1.2" />
          <line x1="194" y1="262" x2="202" y2="270" />
          <line x1="202" y1="262" x2="194" y2="270" />
        </g>
        <rect x="158" y="286" width="30" height="16" rx="4" fill="#fffdf6" strokeWidth="2" />
        <path d="M 170.5 290.5 A 4.5 4.5 0 1 0 175.5 290.5" fill="none" strokeWidth="1.6" />
        <line x1="173" y1="288" x2="173" y2="293" strokeWidth="1.6" />
        <circle className="printer__led" cx="202" cy="294" r="4" fill="#c6ff3d" strokeWidth="2" />
        <rect x="132" y="312" width="32" height="38" rx="3" fill="url(#pr-grille)" strokeWidth="2" />
        <rect x="184" y="312" width="32" height="38" rx="3" fill="url(#pr-grille)" strokeWidth="2" />

        {/* media window: roll + ribbon visible through the glass */}
        <line x1="238" y1="118" x2="238" y2="362" strokeWidth="2.5" />
        <rect x="250" y="134" width="212" height="108" rx="6" fill="#eef3f1" />
        <circle cx="318" cy="186" r="40" fill="#fffdf6" strokeWidth="2.5" />
        <circle cx="318" cy="186" r="31" fill="none" strokeWidth="1.2" />
        <circle cx="318" cy="186" r="23" fill="none" strokeWidth="1.2" />
        <circle cx="318" cy="186" r="12" fill="#ebe7db" strokeWidth="2" />
        <circle cx="318" cy="186" r="4" fill="#111" strokeWidth="1" />
        <circle cx="414" cy="172" r="22" fill="#2a2a2a" strokeWidth="2.5" />
        <circle cx="414" cy="172" r="8" fill="#ebe7db" strokeWidth="2" />
        <path d="M 318 226 C 330 240, 345 244, 360 252" fill="none" stroke="#fffdf6" strokeWidth="9" />
        <path d="M 318 226 C 330 240, 345 244, 360 252" fill="none" strokeWidth="1.2" />
        <rect x="250" y="134" width="212" height="108" rx="6" fill="#cfdcd8" fillOpacity="0.45" />
        <polygon points="262,144 300,144 274,232 262,232" fill="#fff" stroke="none" opacity="0.55" />
        <polygon points="310,144 320,144 294,232 284,232" fill="#fff" stroke="none" opacity="0.55" />
        <rect x="318" y="120" width="76" height="12" rx="3" fill="#111" strokeWidth="1.5" />

        {/* print head, tear bar, exit slot */}
        <rect x="248" y="250" width="216" height="22" rx="4" fill="#ebe7db" strokeWidth="2.5" />
        <rect x="256" y="261" width="200" height="7" rx="2" fill="#111" strokeWidth="1.5" />
        <polyline points="258,278 265,274 272,278 279,274 286,278 293,274 300,278 307,274 314,278 321,274 328,278 335,274 342,278 349,274 356,278 363,274 370,278 377,274 384,278 391,274 398,278 405,274 412,278 419,274 426,278 433,274 440,278 447,274 454,278" fill="none" strokeWidth="1.5" />
      </g>

      {/* motion doodles while printing */}
      <g className="printer__fx" stroke="#111" strokeWidth="3" strokeLinecap="round" opacity="0">
        <line x1="472" y1="300" x2="492" y2="296" />
        <line x1="474" y1="318" x2="500" y2="318" />
        <line x1="472" y1="336" x2="492" y2="340" />
      </g>

      {/* screen + panel text */}
      <g fill="#bdbdb6">
        <rect x="142" y="143" width="4" height="4" rx="1" />
        <rect x="149" y="143" width="4" height="4" rx="1" />
        <rect x="156" y="143" width="4" height="4" rx="1" />
      </g>
      <text x="206" y="148" textAnchor="end" fontFamily="Space Mono, monospace" fontSize="6.5" fill="#8a8a8a">
        12:44
      </text>
      <text className="printer__status" x="174" y="180" textAnchor="middle" fontFamily="Space Mono, monospace" fontSize="11" fontWeight="700" fill="#c6ff3d">
        READY
      </text>
      <text className="printer__count" x="174" y="195" textAnchor="middle" fontFamily="Space Mono, monospace" fontSize="8" fill="#bdbdb6">
        0 / 1
      </text>
      <rect x="144" y="206" width="60" height="5" rx="2.5" fill="#333" />
      <rect className="printer__progress" x="144" y="206" width="0" height="5" rx="2.5" fill="#c6ff3d" />
      <rect x="144" y="222" width="26" height="3" rx="1.5" fill="#333" />
      <rect x="144" y="222" width="21" height="3" rx="1.5" fill="#8fd3ff" />
      <rect x="178" y="222" width="26" height="3" rx="1.5" fill="#333" />
      <rect x="178" y="222" width="23" height="3" rx="1.5" fill="#8fd3ff" />
      <text x="144" y="233" fontFamily="Space Mono, monospace" fontSize="4.5" fill="#8a8a8a">
        MEDIA
      </text>
      <text x="178" y="233" fontFamily="Space Mono, monospace" fontSize="4.5" fill="#8a8a8a">
        RIBBON
      </text>
      {[140, 164, 188].map((x, i) => (
        <text key={x} x={x + 10} y="253" textAnchor="middle" fontFamily="Space Mono, monospace" fontSize="5.5" fontWeight="700" fill="#111">
          {['PAUSE', 'FEED', 'CANCEL'][i]}
        </text>
      ))}
      <text x="356" y="129" textAnchor="middle" fontFamily="Space Mono, monospace" fontSize="7" fontWeight="700" fill="#c6ff3d" letterSpacing="1.5">
        QUICK·LABEL
      </text>

      {/* the label, fed out of the slot */}
      <g clipPath="url(#pr-out)">
        <g className="printer__label" transform="translate(0,-220)">
          <a href={`https://${repo}`} target="_blank" rel="noreferrer">
            <rect x="255" y="262" width="202" height="212" rx="5" fill="#fff" stroke="#111" strokeWidth="2.5" />
            <text x="268" y="294" fontFamily="Space Mono, monospace" fontSize="14" fontWeight="700" fill="#111">
              {title.toUpperCase()}
            </text>
            <text x="444" y="294" textAnchor="end" fontFamily="Space Mono, monospace" fontSize="8" fill="#666">
              № 0001
            </text>
            <g transform="translate(268,304)">
              {BARS.map(([x, w]) => (
                <rect key={x} x={x} y="0" width={w} height="46" fill="#111" />
              ))}
            </g>
            <text x="356" y="364" textAnchor="middle" fontFamily="Space Mono, monospace" fontSize="8" fill="#444" letterSpacing="1.5">
              0 848106 202601 7
            </text>
            <line x1="268" y1="376" x2="444" y2="376" stroke="#111" strokeDasharray="4 4" />
            <text x="268" y="394" fontFamily="Space Mono, monospace" fontSize="9" fill="#666">
              DEMO VERSION · NOT PRODUCTION
            </text>
            <text className="printer__url" x="268" y="414" fontFamily="Space Mono, monospace" fontSize="12" fill="#111">
              {host}
            </text>
            <text className="printer__url" x="268" y="432" fontFamily="Space Mono, monospace" fontSize="14" fontWeight="700" fill="#111">
              {path}
            </text>
            <rect x="268" y="444" width="144" height="20" rx="10" fill="#ff4d1a" stroke="#111" strokeWidth="2" />
            <text x="340" y="458" textAnchor="middle" fontFamily="Space Mono, monospace" fontSize="10" fontWeight="700" fill="#111">
              ↗ open demo repo
            </text>
          </a>
        </g>
      </g>
    </svg>
  )
}
