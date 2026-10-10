import type { ReactNode } from 'react'

/** The site's icons: one consistent line set (24×24 grid, 1.8 stroke, round caps). */
const PATHS: Record<string, ReactNode> = {
  stack: (
    <>
      <rect x="4" y="11" width="16" height="9" rx="2" />
      <path d="M6 8h12M8 5h8" />
    </>
  ),
  grid: (
    <>
      <rect x="4" y="4" width="7" height="7" rx="1.8" />
      <rect x="13" y="4" width="7" height="7" rx="1.8" />
      <rect x="4" y="13" width="7" height="7" rx="1.8" />
      <rect x="13" y="13" width="7" height="7" rx="1.8" />
    </>
  ),
  cards: (
    <>
      <rect x="3.5" y="6" width="10" height="14" rx="2" transform="rotate(-12 8.5 13)" />
      <rect x="10.5" y="4" width="10" height="14" rx="2" transform="rotate(10 15.5 11)" />
    </>
  ),
  terminal: (
    <>
      <rect x="3" y="4.5" width="18" height="15" rx="2.5" />
      <path d="m7.5 9.5 3 2.5-3 2.5M13 15h4" />
    </>
  ),
  shuffle: <path d="M3 7h3.5c2 0 3.2 1 4.3 2.6l2.4 4.8c1.1 1.6 2.3 2.6 4.3 2.6H21M3 17h3.5c1.4 0 2.4-.5 3.2-1.3M14.3 8.3C15.1 7.5 16.1 7 17.5 7H21M18 4l3 3-3 3M18 14l3 3-3 3" />,
  search: (
    <>
      <circle cx="11" cy="11" r="6.5" />
      <path d="m20 20-4.4-4.4" />
    </>
  ),
  sun: (
    <>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4" />
    </>
  ),
  moon: <path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5Z" />,
  close: <path d="M6 6l12 12M18 6 6 18" />,
  arrowUpRight: <path d="M7 17 17 7M8.5 7H17v8.5" />,
  arrowRight: <path d="M4 12h15M13 6l6 6-6 6" />,
  download: <path d="M12 4v11M7 10.5l5 5 5-5M5 20h14" />,
  mail: (
    <>
      <rect x="3" y="5.5" width="18" height="13" rx="2.5" />
      <path d="m4 7.5 8 6 8-6" />
    </>
  ),
  file: (
    <>
      <path d="M14 3.5H7.5A2 2 0 0 0 5.5 5.5v13a2 2 0 0 0 2 2h9a2 2 0 0 0 2-2V8Z" />
      <path d="M14 3.5V8h4.5M9 13h6M9 16.5h4" />
    </>
  ),
  instagram: (
    <>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4.2" />
      <circle cx="17.4" cy="6.6" r="0.6" fill="currentColor" />
    </>
  ),
  glasses: (
    <>
      <circle cx="6.5" cy="14.5" r="3.5" />
      <circle cx="17.5" cy="14.5" r="3.5" />
      <path d="M10 14.5c1.3-1 2.7-1 4 0M3 14.5 5 7h2M21 14.5 19 7h-2" />
    </>
  ),
  drum: (
    <>
      <ellipse cx="12" cy="9" rx="8" ry="3" />
      <path d="M4 9v6.5c0 1.7 3.6 3 8 3s8-1.3 8-3V9M8 11.6v6.6M16 11.6v6.6M15 3l-4.5 5.5M20 4.5l-6 4.3" />
    </>
  ),
  gamepad: (
    <>
      <path d="M7.5 7h9a4.5 4.5 0 0 1 4.4 5.5l-1 4.4a2.2 2.2 0 0 1-3.8 1L14.5 16h-5L7.9 17.9a2.2 2.2 0 0 1-3.8-1l-1-4.4A4.5 4.5 0 0 1 7.5 7Z" />
      <path d="M8 10.5v3M6.5 12h3" />
      <circle cx="15.5" cy="11" r="0.6" fill="currentColor" />
      <circle cx="17" cy="13" r="0.6" fill="currentColor" />
    </>
  ),
  wrench: <path d="M14.5 6.5a4 4 0 0 0-5.3 5L4 16.7a1.9 1.9 0 0 0 2.7 2.7l5.2-5.2a4 4 0 0 0 5-5.3l-2.4 2.4-2.1-.6-.6-2.1Z" />,
  compass: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="m15.5 8.5-2 5-5 2 2-5 5-2Z" />
    </>
  ),
  chevronDown: <path d="m6 9 6 6 6-6" />,
  check: <path d="m5 12.5 4.5 4.5L19 7.5" />,
  copy: (
    <>
      <rect x="8.5" y="8.5" width="12" height="12" rx="2.5" />
      <path d="M15.5 8.5V6a2.5 2.5 0 0 0-2.5-2.5H6A2.5 2.5 0 0 0 3.5 6v7A2.5 2.5 0 0 0 6 15.5h2.5" />
    </>
  ),
  pin: (
    <>
      <path d="M12 21s6.5-5.6 6.5-11a6.5 6.5 0 0 0-13 0c0 5.4 6.5 11 6.5 11Z" />
      <circle cx="12" cy="10" r="2.4" />
    </>
  ),
}

// brand marks are filled shapes, not line icons
const FILLED: Record<string, string> = {
  github:
    'M12 .7a11.5 11.5 0 0 0-3.64 22.4c.58.1.79-.25.79-.56v-2.02c-3.2.7-3.88-1.36-3.88-1.36-.52-1.33-1.28-1.69-1.28-1.69-1.05-.71.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.76 2.7 1.25 3.36.96.1-.75.4-1.25.73-1.54-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.28 1.19-3.09-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.17 1.18a11 11 0 0 1 5.78 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.83 1.19 3.09 0 4.42-2.7 5.39-5.26 5.68.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0 0 12 .7Z',
  linkedin:
    'M5 3.2a2.3 2.3 0 1 1 0 4.6 2.3 2.3 0 0 1 0-4.6ZM3 9.4h4V21H3V9.4Zm6.6 0h3.8V11h.06c.53-1 1.83-2.06 3.77-2.06 4.03 0 4.77 2.65 4.77 6.1V21h-4v-5.25c0-1.25-.02-2.86-1.74-2.86-1.75 0-2.01 1.36-2.01 2.77V21h-4V9.4Z',
}

export type IconName =
  | 'stack' | 'grid' | 'cards' | 'terminal' | 'shuffle' | 'search' | 'sun' | 'moon' | 'close' | 'arrowUpRight'
  | 'arrowRight' | 'download' | 'mail' | 'file' | 'instagram' | 'glasses' | 'drum' | 'gamepad' | 'wrench' | 'pin'
  | 'github' | 'linkedin' | 'compass' | 'chevronDown' | 'check' | 'copy'

export function Icon({ name, size = 16, className }: { name: IconName; size?: number; className?: string }) {
  const filled = FILLED[name]
  return (
    <svg
      className={`icon${className ? ' ' + className : ''}`}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      aria-hidden
      focusable="false"
      fill={filled ? 'currentColor' : 'none'}
      stroke={filled ? 'none' : 'currentColor'}
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {filled ? <path d={filled} /> : PATHS[name]}
    </svg>
  )
}
