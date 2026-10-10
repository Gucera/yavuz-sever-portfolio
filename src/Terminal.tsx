import { useEffect, useRef, useState, type KeyboardEvent, type ReactNode } from 'react'
import { PROFILE, TABS, isProject } from './data'
import { search } from './search'
import type { ViewMode } from './layout'

export type Theme = 'auto' | 'day' | 'night'

type Props = {
  /** opens a tab full screen, the same as clicking it */
  onOpen: (i: number) => void
  onView: (view: ViewMode) => void
  onTheme: (theme: Theme) => void
  onSearch: () => void
  onCopyEmail: () => void
}

type Line = { kind: 'in' | 'out' | 'err' | 'dim'; body: ReactNode }

const slug = (title: string) =>
  title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

// the portfolio as a tiny file system: the personal tabs at the root, projects in a folder
const FILES = TABS.map((tab, i) => ({ i, tab, name: `${slug(tab.title)}.md`, dir: isProject(tab) ? 'projects' : '' }))

const COMMANDS: [string, string][] = [
  ['help', 'show this list'],
  ['ls [dir]', 'list tabs (projects live in projects/)'],
  ['cd <dir>', 'move into projects/, back with cd ..'],
  ['cat <file>', 'print a tab’s summary'],
  ['open <file>', 'open a tab full screen'],
  ['whoami', 'who built this'],
  ['contact', 'email and socials'],
  ['cv', 'download my CV'],
  ['search <words>', 'search every tab (or ⌘K anywhere)'],
  ['view <stack|grid|cards>', 'switch to another view'],
  ['theme <day|night|auto>', 'switch the colour theme'],
  ['history', 'commands you typed'],
  ['clear', 'clear the screen'],
  ['exit', 'back to the stack'],
]
const NAMES = ['help', 'ls', 'cd', 'cat', 'open', 'whoami', 'contact', 'cv', 'search', 'view', 'theme', 'history', 'clear', 'exit', 'pwd', 'date', 'echo']

const BOOT: Line[] = [
  { kind: 'dim', body: 'yss-os 1.0 · last login: just now' },
  { kind: 'out', body: `Welcome. You're inside the portfolio of ${PROFILE.name}, software developer in London.` },
  {
    kind: 'out',
    body: (
      <>
        Type <b>help</b> to see what you can do, or try <b>ls</b> and <b>open about-me.md</b>.
      </>
    ),
  },
]

/** A fourth view: the portfolio as a command line. */
export function Terminal({ onOpen, onView, onTheme, onSearch, onCopyEmail }: Props) {
  const [lines, setLines] = useState<Line[]>(BOOT)
  const [input, setInput] = useState('')
  const [cwd, setCwd] = useState('')
  const [past, setPast] = useState<string[]>([])
  const [cursor, setCursor] = useState(-1) // position while browsing the history with ↑/↓
  const inputRef = useRef<HTMLInputElement>(null)
  const bodyRef = useRef<HTMLDivElement>(null)
  const prompt = `guest@yss:~${cwd ? '/' + cwd : ''}$`

  useEffect(() => {
    bodyRef.current?.scrollTo({ top: bodyRef.current.scrollHeight })
  }, [lines])
  useEffect(() => {
    // on phones focusing would throw the keyboard over the page straight away
    if (window.matchMedia('(hover: hover)').matches) inputRef.current?.focus({ preventScroll: true })
  }, [])

  const find = (arg: string) => {
    const a = arg.toLowerCase().replace(/^\.\/|^projects\//, '').replace(/\.md$/, '')
    if (!a) return undefined
    const n = Number(a)
    if (Number.isInteger(n) && n >= 1 && n <= FILES.length) return FILES[n - 1]
    return FILES.find((f) => f.name.replace(/\.md$/, '') === a) ?? FILES.find((f) => f.name.startsWith(a) || f.tab.title.toLowerCase().includes(a))
  }

  const run = (text: string): Line[] => {
    const [cmd, ...rest] = text.split(/\s+/)
    const arg = rest.join(' ')
    const out = (body: ReactNode): Line => ({ kind: 'out', body })
    const err = (body: ReactNode): Line => ({ kind: 'err', body })
    const dim = (body: ReactNode): Line => ({ kind: 'dim', body })
    switch (cmd.toLowerCase()) {
      case 'help':
        return [
          out(
            <span className="term__table">
              {COMMANDS.map(([c, d]) => (
                <span key={c}>
                  <b>{c}</b>
                  <span>{d}</span>
                </span>
              ))}
            </span>,
          ),
          dim('Tab completes · ↑/↓ for history · a few commands aren’t listed.'),
        ]
      case 'ls': {
        const dir = (arg || cwd).replace(/\/$/, '').replace(/^~\/?/, '')
        if (dir && dir !== 'projects') return [err(`ls: ${arg}: no such directory`)]
        return [
          out(
            <span className="term__ls">
              {!dir && <b className="term__dir">projects/</b>}
              {FILES.filter((f) => f.dir === dir).map((f) => (
                <button key={f.name} type="button" className="term__file" onClick={() => onOpen(f.i)}>
                  {f.name}
                </button>
              ))}
            </span>,
          ),
        ]
      }
      case 'cd':
        if (!arg || arg === '~' || arg === '..' || arg === '/') {
          setCwd('')
          return []
        }
        if (arg.replace(/\/$/, '') === 'projects') {
          setCwd('projects')
          return []
        }
        return [err(`cd: ${arg}: no such directory`)]
      case 'pwd':
        return [out(`/home/guest${cwd ? '/' + cwd : ''}`)]
      case 'cat': {
        const f = find(arg)
        if (!f) return [err(arg ? `cat: ${arg}: no such file` : 'cat: which file? try ls')]
        return [
          out(
            <span className="term__cat">
              <b>
                # {f.tab.title} <em>· {f.tab.kind} · {f.tab.year}</em>
              </b>
              <span>{f.tab.description}</span>
              {f.tab.meta.map(([k, v]) => (
                <span key={k} className="term__kv">
                  <em>{k}</em> {v}
                </span>
              ))}
              <span className="term__dim">→ open {f.name} to read the whole tab</span>
            </span>,
          ),
        ]
      }
      case 'open': {
        const f = find(arg)
        if (!f) return [err(arg ? `open: ${arg}: no such file` : 'open: which file? try ls')]
        window.setTimeout(() => onOpen(f.i), 250)
        return [dim(`opening ${f.name}…`)]
      }
      case 'whoami':
        return [out(`${PROFILE.name} · software developer · London. I build software that solves practical, operational problems.`)]
      case 'contact':
        onCopyEmail()
        return [
          out(
            <span className="term__cat">
              <span>
                email <a href={`mailto:${PROFILE.email}`}>{PROFILE.email}</a> <em className="term__dim">(copied)</em>
              </span>
              {PROFILE.socials.map(([label, url]) => (
                <span key={label}>
                  {label.toLowerCase()}{' '}
                  <a href={url} target="_blank" rel="noreferrer">
                    {url.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '')}
                  </a>
                </span>
              ))}
            </span>,
          ),
        ]
      case 'cv': {
        const a = document.createElement('a')
        a.href = PROFILE.cv
        a.download = ''
        a.click()
        return [out('downloading Yavuz_Selim_Sever_CV.pdf…')]
      }
      case 'search': {
        if (!arg) {
          onSearch()
          return []
        }
        const hits = search(arg)
        if (!hits.length) return [err(`no matches for “${arg}”`)]
        return [
          out(
            <span className="term__cat">
              {hits.map((h) => (
                <span key={h.i}>
                  <button type="button" className="term__file" onClick={() => onOpen(h.i)}>
                    {FILES[h.i].name}
                  </button>{' '}
                  <em className="term__dim">{h.snippet}</em>
                </span>
              ))}
            </span>,
          ),
        ]
      }
      case 'view':
        if (arg === 'stack' || arg === 'grid' || arg === 'cards') {
          window.setTimeout(() => onView(arg), 200)
          return [dim(`switching to ${arg}…`)]
        }
        return [err('view: stack, grid or cards')]
      case 'theme':
        if (arg === 'day' || arg === 'night' || arg === 'auto') {
          onTheme(arg)
          return [out(arg === 'auto' ? 'theme now follows the time of day' : `${arg} theme on`)]
        }
        return [err('theme: day, night or auto')]
      case 'history':
        return [out(past.length ? past.map((p, i) => `${String(i + 1).padStart(3)}  ${p}`).join('\n') : 'nothing yet')]
      case 'date':
        return [out(new Date().toString())]
      case 'echo':
        return [out(arg)]
      case 'exit':
        window.setTimeout(() => onView('stack'), 200)
        return [dim('logout')]
      // not in help
      case 'sudo':
        if (/hire/.test(arg)) {
          onCopyEmail()
          return [out(`[sudo] permission granted. ${PROFILE.email} is on your clipboard. Let’s talk.`)]
        }
        if (/rm\s+-rf/.test(arg)) return [err('nice try. This portfolio is read-only.')]
        return [err('guest is not in the sudoers file. This incident will be reported.')]
      case 'rm':
        return [err('rm: permission denied (and please don’t)')]
      case 'coffee':
        return [out('☕ brewing… done. Ready when you are.')]
      case 'drums':
      case 'drum':
        return [out('🥁 ba-dum-tss')]
      case 'konami':
        return [out('↑ ↑ ↓ ↓ ← → ← → B A. Try it anywhere outside this prompt.')]
      case 'vim':
      case 'vi':
      case 'emacs':
        return [out('this terminal only speaks portfolio. :q')]
      default:
        return [err(`${cmd}: command not found. Try help.`)]
    }
  }

  const submit = (raw: string) => {
    const cmd = raw.trim()
    if (cmd === 'clear') setLines([])
    else setLines((l) => [...l, { kind: 'in', body: `${prompt} ${cmd}` }, ...(cmd ? run(cmd) : [])])
    if (cmd) setPast((p) => [...p, cmd])
    setCursor(-1)
    setInput('')
  }

  const complete = () => {
    const parts = input.split(/\s+/)
    const show = (m: string[]) => setLines((l) => [...l, { kind: 'in', body: `${prompt} ${input}` }, { kind: 'dim', body: m.join('   ') }])
    if (parts.length === 1) {
      const m = NAMES.filter((n) => n.startsWith(parts[0]))
      if (m.length === 1) setInput(m[0] + ' ')
      else if (m.length > 1) show(m)
      return
    }
    const last = parts[parts.length - 1].replace(/^projects\//, '')
    const pool = [...FILES.filter((f) => f.dir === cwd || parts[parts.length - 1].startsWith('projects/')).map((f) => f.name), ...(cwd ? [] : ['projects/'])]
    const m = pool.filter((n) => n.startsWith(last))
    if (m.length === 1) setInput([...parts.slice(0, -1), m[0]].join(' '))
    else if (m.length > 1) show(m)
  }

  const onKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') return submit(input)
    if (e.key === 'Tab') {
      e.preventDefault()
      return complete()
    }
    if (e.key === 'l' && e.ctrlKey) {
      e.preventDefault()
      return setLines([])
    }
    if (e.key !== 'ArrowUp' && e.key !== 'ArrowDown') return
    e.preventDefault()
    if (!past.length) return
    const next = e.key === 'ArrowUp' ? (cursor === -1 ? past.length - 1 : Math.max(0, cursor - 1)) : cursor === -1 ? -1 : cursor + 1
    if (next === -1 || next >= past.length) {
      setCursor(-1)
      setInput('')
    } else {
      setCursor(next)
      setInput(past[next])
    }
  }

  return (
    <section
      className="term"
      aria-label="Terminal"
      onClick={() => {
        if (window.getSelection()?.isCollapsed) inputRef.current?.focus({ preventScroll: true })
      }}
    >
      <div className="term__bar">
        <span />
        <span />
        <span />
        <em>guest@yss — portfolio</em>
      </div>
      <div className="term__body" ref={bodyRef}>
        {lines.map((l, i) => (
          <div key={i} className={`term__line term__line--${l.kind}`}>
            {l.body}
          </div>
        ))}
        <label className="term__input">
          <span className="term__prompt">{prompt}</span>
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKey}
            spellCheck={false}
            autoCapitalize="off"
            autoComplete="off"
            autoCorrect="off"
            enterKeyHint="send"
            aria-label="Terminal command"
          />
        </label>
      </div>
      {/* phones: one tap instead of typing */}
      <div className="term__chips">
        {['help', 'ls', 'cd projects', 'whoami', 'contact', 'clear'].map((c) => (
          <button
            key={c}
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              submit(c)
            }}
          >
            {c}
          </button>
        ))}
      </div>
    </section>
  )
}
