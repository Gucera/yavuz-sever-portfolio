import { useCallback, useEffect, useState } from 'react'
import { PROFILE } from '../data'

/**
 * Copies the email address (mail apps often aren't set up) and shows a short note with an
 * "Open mail app" button. Used by the header's Hire me and email, and the dock — other email
 * links on the site open the mail app as usual.
 */
export function useEmailCopy() {
  const [note, setNote] = useState(false)
  const copyEmail = useCallback(() => {
    const done = () => setNote(true)
    try {
      navigator.clipboard.writeText(PROFILE.email).then(done, done)
    } catch {
      done()
    }
  }, [])
  useEffect(() => {
    if (!note) return
    const t = window.setTimeout(() => setNote(false), 4500)
    return () => window.clearTimeout(t)
  }, [note])
  return { copyEmail, mailNote: note, closeMailNote: () => setNote(false) }
}
