import { PROFILE } from '../data'

/** The poker toast, and the "email copied" note with a way into the mail app. */
export function Toasts({ toast, mailNote, onCloseMail }: { toast: string | null; mailNote: boolean; onCloseMail: () => void }) {
  return (
    <>
      {toast && (
        <div className="toast" role="status">
          {toast}
        </div>
      )}
      {mailNote && (
        <div className="mail-note" role="status">
          <span>
            <b>{PROFILE.email}</b> copied
          </span>
          <a href={`mailto:${PROFILE.email}`} onClick={onCloseMail}>
            Open mail app
          </a>
        </div>
      )}
    </>
  )
}
