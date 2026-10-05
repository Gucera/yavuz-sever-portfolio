import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Analytics } from '@vercel/analytics/react'
import './index.css'
import App from './App.tsx'
import { CookieBanner } from './CookieBanner'
import { getConsent, initGoogleAnalytics } from './googleAnalytics'

// Google Analytics sets cookies, so it only loads once the visitor has accepted.
if (getConsent() === 'granted') initGoogleAnalytics()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
    <Analytics />
    <CookieBanner />
  </StrictMode>,
)
