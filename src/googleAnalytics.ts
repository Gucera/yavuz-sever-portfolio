declare global {
  interface Window {
    dataLayer: unknown[]
    gtag: (...args: unknown[]) => void
  }
}

// GA4 measurement IDs are public (they ship in the page), so the default lives here.
const DEFAULT_GA_ID = 'G-T6VELC532W'
const CONSENT_KEY = 'analytics-consent'

export type Consent = 'granted' | 'denied'

/** The GA ID for this build: VITE_GA_ID overrides; the dev server has none, so local testing stays untracked. */
export function gaId() {
  return (import.meta.env.VITE_GA_ID as string | undefined) || (import.meta.env.PROD ? DEFAULT_GA_ID : undefined)
}

export function getConsent(): Consent | null {
  try {
    const v = localStorage.getItem(CONSENT_KEY)
    return v === 'granted' || v === 'denied' ? v : null
  } catch {
    return null
  }
}

export function setConsent(value: Consent) {
  try {
    localStorage.setItem(CONSENT_KEY, value)
  } catch {
    // storage blocked (private mode etc.) — the choice just isn't remembered
  }
  if (value === 'granted') initGoogleAnalytics()
}

let loaded = false

/** Loads Google Analytics 4. Only called once the visitor has accepted analytics cookies. */
export function initGoogleAnalytics() {
  const id = gaId()
  if (!id || loaded) return
  loaded = true

  window.dataLayer = window.dataLayer || []
  window.gtag = function gtag() {
    // gtag.js expects the raw `arguments` object, not an array
    // eslint-disable-next-line prefer-rest-params
    window.dataLayer.push(arguments)
  }
  window.gtag('js', new Date())
  window.gtag('config', id, { anonymize_ip: true })

  const script = document.createElement('script')
  script.async = true
  script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(id)}`
  document.head.appendChild(script)
}
