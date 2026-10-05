declare global {
  interface Window {
    dataLayer: unknown[]
    gtag: (...args: unknown[]) => void
  }
}

/**
 * Loads Google Analytics 4 when VITE_GA_ID (e.g. G-XXXXXXXXXX) is set at build time.
 * Without it nothing is loaded, so local builds and previews stay untracked.
 */
export function initGoogleAnalytics() {
  const id = import.meta.env.VITE_GA_ID as string | undefined
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
