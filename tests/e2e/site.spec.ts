import { expect, test, type Page } from '@playwright/test'

// Most flows run with reduced motion, so the page settles instantly and the checks are about
// behaviour, not animation timing. The deal and shuffle tests turn motion back on.
test.use({ reducedMotion: 'reduce' })

const fresh = async (page: Page, path = '/') => {
  await page.addInitScript(() => {
    if (!sessionStorage.getItem('__seeded')) {
      localStorage.clear()
      localStorage.setItem('explore-hint', 'seen') // the hint has its own test
      sessionStorage.setItem('__seeded', '1')
    }
  })
  await page.goto(path)
  await expect(page.locator('.card').first()).toBeVisible()
}

const card = (page: Page, title: string) => page.locator('.card', { has: page.locator('.card__title', { hasText: title }) })
const openCard = (page: Page) => page.locator('.card[role="dialog"]')

const switchView = async (page: Page, label: 'Stack' | 'Grid' | 'Cards' | 'Terminal') => {
  await page.locator('.explore__btn').click()
  await page.getByRole('menuitemradio', { name: new RegExp(label) }).click()
  await expect(page.locator('main.stage')).toHaveClass(new RegExp(`stage--${label.toLowerCase()}`))
}

test('a tab opens at its own address and closes with its ×', async ({ page }) => {
  await fresh(page)
  await card(page, 'About me').click()
  await expect(page).toHaveURL(/\/about-me$/)
  await expect(openCard(page)).toBeVisible()
  await openCard(page).getByRole('button', { name: 'Close About me' }).click()
  await expect(openCard(page)).toHaveCount(0)
  await expect(page).toHaveURL(/\/$/)
})

test('a shared link opens that tab straight away', async ({ page }) => {
  await fresh(page, '/wholesale-ops-portal')
  await expect(openCard(page).locator('.card__title')).toHaveText('Wholesale Ops Portal')
})

test('old links to the map, Quick Label and Nisa open the portal tab that now holds them', async ({ page }) => {
  for (const slug of ['uk-customer-map', 'quick-label', 'nisa-automation']) {
    await fresh(page, `/${slug}`)
    await expect(openCard(page).locator('.card__title')).toHaveText('Wholesale Ops Portal')
    await expect(page).toHaveURL(/\/wholesale-ops-portal$/)
  }
})

test('the portal tab tells each module with its own illustration', async ({ page }) => {
  await fresh(page, '/wholesale-ops-portal')
  const tab = openCard(page)
  await expect(tab.locator('.pm')).toHaveCount(7) // six modules and the shared shell
  await expect(tab.locator('#pm-map .ukmap')).toHaveCount(1)
  await expect(tab.locator('#pm-labels .printer__label')).toHaveCount(1)
  await expect(tab.locator('#pm-nisa .run__line')).toHaveCount(10)
  // the module index scrolls to a module, and its animation runs once it's in view
  await tab.locator('.portal__index button', { hasText: 'Nisa Automation' }).click()
  await expect(tab.locator('#pm-nisa .run__line').first()).toHaveCSS('opacity', '1')
  await tab.locator('#pm-labels').scrollIntoViewIfNeeded()
  await expect(tab.locator('#pm-labels .printer__status')).toHaveText('DONE')
  // every screenshot is there
  const broken = await tab.locator('.pshot img').evaluateAll(async (imgs) => {
    const list = imgs as HTMLImageElement[]
    for (const img of list) img.loading = 'eager'
    await Promise.all(list.map((img) => img.decode().catch(() => undefined)))
    return list.filter((img) => !img.naturalWidth).map((img) => img.src)
  })
  expect(broken).toEqual([])
})

test('the Stack is home; Grid, Cards and Terminal live in the Explore menu, and the choice is remembered', async ({ page }) => {
  await fresh(page)
  await expect(page.locator('main.stage')).toHaveClass(/stage--stack/)
  await page.locator('.explore__btn').click()
  await expect(page.getByRole('menuitemradio')).toHaveCount(4)
  await page.keyboard.press('Escape')
  await expect(page.locator('.explore__menu')).toHaveCount(0)

  await switchView(page, 'Grid')
  await page.reload()
  await expect(page.locator('main.stage')).toHaveClass(/stage--grid/)
  await switchView(page, 'Stack')
  await page.reload()
  await expect(page.locator('main.stage')).toHaveClass(/stage--stack/)
})

test('the Explore hint shows once on a first visit', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('.explore__hint')).toBeVisible({ timeout: 8000 })
  await page.locator('.explore__hint').getByRole('button', { name: 'Got it' }).click()
  await expect(page.locator('.explore__hint')).toHaveCount(0)
  await page.reload()
  await page.waitForTimeout(2500)
  await expect(page.locator('.explore__hint')).toHaveCount(0)
})

test('search opens a tab, and its × closes it, even for a project inside the grid folder', async ({ page }) => {
  await fresh(page)
  await switchView(page, 'Grid')
  await page.getByRole('button', { name: 'Search all tabs' }).click()
  await page.locator('.spot__input').fill('quick label')
  await page.locator('.spot__results button').first().click()
  await expect(openCard(page).locator('.card__title')).toHaveText('Wholesale Ops Portal')
  await openCard(page).getByRole('button', { name: 'Close Wholesale Ops Portal' }).click()
  await expect(openCard(page)).toHaveCount(0)
})

test('there are no keyboard shortcuts, only Escape to close', async ({ page }) => {
  await fresh(page)
  for (const key of ['/', 'ArrowRight', 'ArrowLeft', 'Meta+k', 'Control+k', 'Alt+Tab']) {
    await page.keyboard.press(key)
  }
  await expect(page.locator('.spot')).toHaveCount(0)
  await expect(openCard(page)).toHaveCount(0)
  for (const key of ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a']) {
    await page.keyboard.press(key)
  }
  await expect(page.locator('.confetti')).toHaveCount(0)
  await card(page, 'Education').dispatchEvent('click')
  await expect(openCard(page)).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(openCard(page)).toHaveCount(0)
})

test('Hire me copies the email; ordinary email links still open the mail app', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write'])
  await fresh(page)
  await page.getByRole('button', { name: 'Hire me' }).click()
  await expect(page.locator('.mail-note')).toContainText('copied')
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe('yavuzslm057@gmail.com')

  // the About tab's contact link is a plain mailto: nothing on the page cancels it
  await card(page, 'About me').click()
  const link = openCard(page).locator('.about__contact a[href^="mailto:"]')
  await expect(link).toHaveAttribute('href', 'mailto:yavuzslm057@gmail.com')
  const cancelledByPage = await link.evaluate((a) => {
    let cancelled = false
    // last listener in the chain: record whether anything earlier cancelled it, then stop the navigation
    document.addEventListener('click', (ev) => {
      cancelled = ev.defaultPrevented
      ev.preventDefault()
    }, { once: true })
    a.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))
    return cancelled
  })
  expect(cancelledByPage).toBe(false)
})

test('About ends with a way to get in touch', async ({ page }) => {
  await fresh(page, '/about-me')
  const contact = openCard(page).locator('.about__contact')
  await expect(contact).toContainText('Get in touch')
  await expect(contact.locator('a[href*="linkedin"]')).toBeVisible()
  await expect(contact.locator('a[download]')).toBeVisible()
})

test('every project starts with a 3-line summary and folds its technical details', async ({ page }) => {
  for (const slug of ['wholesale-ops-portal', 'catalogue-maker', 'dimark-online', 'candy-cargo']) {
    await fresh(page, `/${slug}`)
    const tab = openCard(page)
    const summary = tab.locator('.summary')
    await expect(summary.locator('dt')).toHaveText(['Problem', 'What I built', 'Result'])
    await expect(summary.locator('.summary__stats li').first()).toBeVisible()
    const toggle = tab.locator('.more__toggle')
    await expect(toggle).toHaveAttribute('aria-expanded', 'false')
    await expect(tab.locator('.more__body')).toHaveCount(0)
    await toggle.click()
    await expect(tab.locator('.more__body .panel').first()).toBeVisible()
  }
})

test('closed tabs are light: technical details are not rendered until a tab is opened', async ({ page }) => {
  await fresh(page)
  await expect(page.locator('.more')).toHaveCount(0)
  await expect(page.locator('.uel-badge--flat')).toHaveCount(1) // the crest is a flat picture
  await expect(page.locator('.pm')).toHaveCount(0) // nor are the portal's modules and screenshots
  await card(page, 'Wholesale Ops Portal').dispatchEvent('click')
  await expect(openCard(page).locator('.more')).toHaveCount(1)
})

test('Catalogue Maker shows its four tools and an illustrative catalogue beside them', async ({ page }) => {
  await fresh(page, '/catalogue-maker')
  const tab = openCard(page)
  await expect(tab.locator('.card__title')).toHaveText('Catalogue Maker')
  await expect(tab.locator('.catm__parts > li h3')).toHaveText(['Flyers', 'Focals', 'PDF Extract', 'Compact'])
  await expect(tab.locator('.catv__page').first()).toBeVisible()
  await expect(tab.locator('.catv__count')).toHaveText('1 / 212') // reduced motion: it stays on the cover
  await expect(tab.locator('.catv__note')).toContainText('made-up')
  await expect(tab.locator('a.catm__repo')).toHaveAttribute('href', 'https://github.com/Gucera/Catalogue-Creator')
})

test('the customer map keeps Fit UK and Street view behind a Demo button', async ({ page }) => {
  await fresh(page, '/wholesale-ops-portal')
  const ctl = openCard(page).locator('.ukmap__ctl')
  await expect(ctl.getByRole('button', { name: 'Fit UK' })).toHaveCount(0)
  await ctl.getByRole('button', { name: 'Demo' }).click()
  await ctl.getByRole('button', { name: 'Fit UK' }).click()
  await expect(openCard(page).locator('.ukmap')).toHaveClass(/ukmap--uk/)
})

test('the terminal shows quick commands, and contact has an Email me button', async ({ page }) => {
  await fresh(page)
  await switchView(page, 'Terminal')
  await expect(page.locator('.term__chips button').first()).toBeVisible()
  await page.locator('.term__chips button', { hasText: 'contact' }).click()
  await expect(page.locator('.term a.term__btn--main')).toHaveAttribute('href', 'mailto:yavuzslm057@gmail.com')
  await page.locator('.term__chips button', { hasText: 'open about-me.md' }).click()
  await expect(openCard(page).locator('.card__title')).toHaveText('About me')
})

test.describe('with motion', () => {
  test.use({ reducedMotion: 'no-preference' })

  test('cards: a dealt card opens, then stays on the table after closing', async ({ page }) => {
    await fresh(page)
    await page.waitForTimeout(2500) // intro
    await switchView(page, 'Cards')
    await page.waitForTimeout(1800) // flight
    await card(page, 'Wholesale Ops Portal').dispatchEvent('click')
    await expect(openCard(page).locator('.card__title')).toHaveText('Wholesale Ops Portal', { timeout: 6000 })
    await openCard(page).getByRole('button', { name: 'Close Wholesale Ops Portal' }).click()
    await expect(card(page, 'Wholesale Ops Portal')).toHaveClass(/card--table/)
  })

  test('the catalogue turns its own pages while the tab is open', async ({ page }) => {
    await fresh(page, '/catalogue-maker')
    const count = openCard(page).locator('.catv__count')
    await expect(count).toHaveText('1 / 212')
    await expect(count).not.toHaveText('1 / 212', { timeout: 6000 })
    const y = await openCard(page).locator('.catv__track').evaluate((el) => new DOMMatrix(getComputedStyle(el).transform).m42)
    expect(y).toBeLessThan(0)
  })

  test('cards: after a shuffle the hand overlaps in order, About me on top', async ({ page }) => {
    await fresh(page)
    await page.waitForTimeout(2500)
    await switchView(page, 'Cards')
    await page.waitForTimeout(1800)
    await card(page, 'Candy Cargo').dispatchEvent('click')
    await expect(openCard(page)).toBeVisible({ timeout: 6000 })
    await page.keyboard.press('Escape')
    await page.waitForTimeout(900)
    await page.getByRole('button', { name: 'Shuffle' }).click()
    await expect(page.locator('main.stage')).toHaveClass(/stage--shuffling/)
    await expect(page.locator('main.stage')).not.toHaveClass(/stage--shuffling/, { timeout: 8000 })
    const z = await page.locator('.card').evaluateAll((els) => els.map((e) => Number(getComputedStyle(e).zIndex)))
    for (let k = 1; k < z.length; k++) expect(z[k]).toBeLessThan(z[k - 1])
  })
})
