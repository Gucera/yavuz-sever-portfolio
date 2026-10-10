import type { ReactNode } from 'react'
import { ABOUT, PROFILE, type Tab } from './data'
import { Icon } from './Icon'

type Props = {
  tab: Tab
  meta: ReactNode
  next: ReactNode
}

const pad = (i: number) => String(i + 1).padStart(2, '0')

/** About me: intro + portrait, how I work, values, beyond code, closing. */
export function AboutBody({ tab, meta, next }: Props) {
  return (
    <div className="edu about">
      <div className="edu__top">
        <div className="edu__intro">
          <h3 className="exp__headline" data-reveal>
            {ABOUT.headline}
          </h3>
          <div className="exp__story" data-reveal>
            <p>{tab.description}</p>
            <p>{ABOUT.intro}</p>
          </div>
          {meta}
        </div>
        <div className="media exp__photo about__photo" data-reveal>
          <img src="/assets/portrait.webp" alt="Portrait of Yavuz Selim Sever" width={1254} height={1254} />
          {/* easter egg: in the cards view this preview shows the King of Spades */}
          <img className="about__king" src="/assets/king.png" alt="" aria-hidden width={213} height={340} />
        </div>
      </div>

      <section className="panel cs__dark" data-reveal>
        <span className="panel__label">How I work</span>
        <div className="about__how">
          <p className="cs__quote">{ABOUT.howLine}</p>
          <div className="exp__story">
            {ABOUT.how.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </div>
        </div>
      </section>

      <section className="panel" data-reveal>
        <span className="panel__label">What I care about</span>
        <ul className="cs__features">
          {ABOUT.values.map(([title, text], i) => (
            <li key={title}>
              <span className="exp__num">{pad(i)}</span>
              <h3>{title}</h3>
              <p>{text}</p>
            </li>
          ))}
        </ul>
      </section>

      <div className="exp__bottom" data-reveal>
        <section className="panel">
          <span className="panel__label">Beyond code</span>
          <p className="cs__text">{ABOUT.beyond}</p>
        </section>
        <section className="panel about__closing">
          <span className="panel__label">Right now</span>
          <p className="cs__text">{ABOUT.closing}</p>
        </section>
      </div>

      <section className="panel about__contact" data-reveal>
        <span className="panel__label">Get in touch</span>
        <p className="cs__quote">Have a role or a project in mind? Let’s talk.</p>
        <div className="about__links">
          <a className="about__link about__link--main" href={`mailto:${PROFILE.email}`}>
            <Icon name="mail" size={18} />
            {PROFILE.email}
          </a>
          <a className="about__link" href={PROFILE.socials[1][1]} target="_blank" rel="noreferrer">
            <Icon name="linkedin" size={18} />
            LinkedIn
          </a>
          <a className="about__link" href={PROFILE.cv} download>
            <Icon name="download" size={18} />
            Download CV
          </a>
        </div>
      </section>

      {next}
    </div>
  )
}
