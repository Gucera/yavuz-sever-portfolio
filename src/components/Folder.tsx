import type { Rect } from '../layout'

type Props = {
  rect: Rect
  open: boolean
  raised: boolean
  flying: boolean
  tabOpen: boolean
  count: number
  editMode: boolean
  onOpen: () => void
  onClose: () => void
  onEdit: () => void
}

/** Grid view: the iOS-style folder the projects live in, and the dimmed backdrop behind it. */
export function Folder({ rect, open, raised, flying, tabOpen, count, editMode, onOpen, onClose, onEdit }: Props) {
  return (
    <>
      <div className={`folder-backdrop${open && !tabOpen ? ' is-open' : ''}`} style={{ zIndex: raised ? 240 : -1 }} onClick={onClose} />
      <div
        className={`folder${open ? ' is-open' : ''}${flying ? ' is-flying' : ''}${tabOpen ? ' is-hidden' : ''}`}
        style={{ top: rect.top, left: rect.left, width: rect.width, height: rect.height, zIndex: raised ? 250 : 0 }}
        onClick={() => !open && !editMode && onOpen()}
        onPointerDown={(e) => {
          if (open || editMode) return
          const t = window.setTimeout(onEdit, 520)
          const stop = () => window.clearTimeout(t)
          e.currentTarget.addEventListener('pointerup', stop, { once: true })
          e.currentTarget.addEventListener('pointerleave', stop, { once: true })
        }}
        role={open ? 'dialog' : 'button'}
        aria-label={open ? 'Projects' : `Open Projects folder (${count})`}
        tabIndex={open ? -1 : 0}
        onKeyDown={(e) => {
          if (!open && (e.key === 'Enter' || e.key === ' ')) {
            e.preventDefault()
            onOpen()
          }
        }}
      >
        <span className="folder__title">Projects</span>
        <span className="folder__badge" aria-hidden>
          {count}
        </span>
        <span className="card__chip folder__chip" aria-hidden>
          <i />
          Projects
          <em>{count}</em>
        </span>
      </div>
    </>
  )
}
