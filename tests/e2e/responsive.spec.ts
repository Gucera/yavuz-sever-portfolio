import { expect, test } from '@playwright/test'

// Every view and every tab, at phone, tablet, laptop and wide-screen sizes (portrait and
// landscape): nothing may run off the side of the window, and nothing may sit under the header.
test.use({ reducedMotion: 'reduce' })

const SIZES = [
  [320, 640],
  [375, 812],
  [667, 375],
  [768, 1024],
  [844, 390],
  [1024, 768],
  [1280, 720],
  [1440, 900],
  [1920, 1080],
] as const

const VIEWS = ['Stack', 'Grid', 'Cards', 'Terminal'] as const

for (const [w, h] of SIZES) {
  test(`views and tabs fit at ${w}x${h}`, async ({ page }) => {
    await page.setViewportSize({ width: w, height: h })
    await page.addInitScript(() => localStorage.setItem('explore-hint', 'seen'))
    await page.goto('/')
    await expect(page.locator('.card').first()).toBeVisible()

    for (const view of VIEWS) {
      await page.locator('.explore__btn').click()
      await page.getByRole('menuitemradio', { name: new RegExp(view) }).click()
      await expect(page.locator('main.stage')).toHaveClass(new RegExp(`stage--${view.toLowerCase()}`))
      await page.waitForTimeout(400) // the header is re-measured a frame later
      const problems = await page.evaluate((name) => {
        const vw = innerWidth
        const out: string[] = []
        if (document.documentElement.scrollWidth > vw) out.push('page scrolls sideways')
        const header = document.querySelector('.header')!.getBoundingClientRect()
        const id = document.querySelector('.header__id')!.getBoundingClientRect()
        const meta = document.querySelector('.header__meta')!.getBoundingClientRect()
        const overlapIdMeta = !(id.right <= meta.left || meta.right <= id.left || id.bottom <= meta.top || meta.bottom <= id.top)
        if (overlapIdMeta) out.push('header name and controls overlap')
        for (const el of document.querySelectorAll('.header *')) {
          const r = el.getBoundingClientRect()
          if (r.width && (r.right > vw + 1 || r.left < -1)) out.push('header runs off screen')
        }
        const cards = [...document.querySelectorAll<HTMLElement>('.card')].filter((c) => getComputedStyle(c).opacity !== '0').map((c) => c.getBoundingClientRect())
        if (name !== 'Terminal' && cards.length && Math.min(...cards.map((r) => r.top)) < header.bottom - 2) out.push('cards under the header')
        if (name !== 'Cards' && cards.some((r) => r.left < -2 || r.right > vw + 2)) out.push('cards off screen')
        const term = document.querySelector('.term-wrap')?.getBoundingClientRect()
        if (term && (term.top < header.bottom - 2 || term.bottom > innerHeight)) out.push('terminal out of place')
        const dock = document.querySelector('.dock')?.getBoundingClientRect()
        if (dock && cards.length && Math.max(...cards.map((r) => r.bottom)) > dock.top + 2) out.push('grid under the dock')
        return [...new Set(out)]
      }, view)
      expect(problems, `${view} at ${w}x${h}`).toEqual([])
    }

    // back to the stack, then every tab opened full screen
    await page.locator('.explore__btn').click()
    await page.getByRole('menuitemradio', { name: /Stack/ }).click()
    const titles = await page.locator('.card__title').allTextContents()
    for (const title of titles) {
      await page.goto('/' + title.toLowerCase().replace(/[^a-z0-9]+/g, '-'))
      const tab = page.locator('.card[role="dialog"]')
      await expect(tab).toBeVisible()
      const toggle = tab.locator('.more__toggle')
      if (await toggle.count()) await toggle.click() // check the technical details too
      const off = await tab.evaluate((card) => {
        const vw = innerWidth
        const clippedByScroller = (el: Element) => {
          for (let p = el.parentElement; p && p !== card; p = p.parentElement) {
            if (/(auto|scroll|hidden|clip)/.test(getComputedStyle(p).overflowX)) {
              const r = p.getBoundingClientRect()
              return r.right <= vw + 1 && r.left >= -1
            }
          }
          return false
        }
        const bad: string[] = []
        for (const el of card.querySelectorAll('*')) {
          if (el.closest('svg') && el.tagName !== 'svg') continue
          const r = el.getBoundingClientRect()
          if (!r.width || !r.height) continue
          if ((r.right > vw + 1 || r.left < -1) && !clippedByScroller(el)) bad.push(String((el as HTMLElement).className || el.tagName))
        }
        return [...new Set(bad)].slice(0, 5)
      })
      expect(off, `${title} at ${w}x${h}`).toEqual([])
    }
  })
}
