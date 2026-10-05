declare global {
  interface Window {
    dataLayer: unknown[]
    gtag: (...args: unknown[]) => void
  }
}

// GA4 measurement IDs are public (they ship in the page), so the default lives here.
const DEFAULT_GA_ID = 'G-T6VELC532W'

/**
 * Loads Google Analytics 4 in production builds. VITE_GA_ID overrides the ID;
 * the dev server never loads it, so local testing stays untracked.
 */
export function initGoogleAnalytics() {
  const id = (import.meta.env.VITE_GA_ID as string | undefined) || (import.meta.env.PROD ? DEFAULT_GA_ID : undefined)
  if (!id) return

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
