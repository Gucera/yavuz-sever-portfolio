import { useState } from 'react'
import { gaId, getConsent, setConsent, type Consent } from './googleAnalytics'

/** Asks for analytics-cookie consent; Google Analytics only loads after "Accept". */
export function CookieBanner() {
  const [open, setOpen] = useState(() => Boolean(gaId()) && getConsent() === null)
  if (!open) return null

  const choose = (value: Consent) => {
    setConsent(value)
    setOpen(false)
  }

  return (
    <div className="consent" role="dialog" aria-label="Cookie consent" aria-live="polite">
      <p>
        I use Google Analytics cookies to see how people find and use this site. Nothing is tracked unless you
        accept.
      </p>
      <div className="consent__actions">
        <button className="consent__btn" onClick={() => choose('denied')}>
          Decline
        </button>
        <button className="consent__btn consent__btn--accept" onClick={() => choose('granted')}>
          Accept
        </button>
      </div>
    </div>
  )
}
