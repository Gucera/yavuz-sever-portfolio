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
  await fresh(page, '/uk-customer-map')
  await expect(openCard(page).locator('.card__title')).toHaveText('UK Customer Map')
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
  await page.locator('.spot__input').fill('label')
  await page.locator('.spot__results button').first().click()
  await expect(openCard(page).locator('.card__title')).toHaveText('Quick Label')
  await openCard(page).getByRole('button', { name: 'Close Quick Label' }).click()
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
  for (const slug of ['quick-label', 'nisa-automation', 'uk-customer-map', 'dimark-online', 'candy-cargo']) {
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
  await card(page, 'Quick Label').dispatchEvent('click')
  await expect(openCard(page).locator('.more')).toHaveCount(1)
})

test('the UK map keeps Fit UK and Street view behind a Demo button', async ({ page }) => {
  await fresh(page, '/uk-customer-map')
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
    await card(page, 'Nisa Automation').dispatchEvent('click')
    await expect(openCard(page).locator('.card__title')).toHaveText('Nisa Automation', { timeout: 6000 })
    await openCard(page).getByRole('button', { name: 'Close Nisa Automation' }).click()
    await expect(card(page, 'Nisa Automation')).toHaveClass(/card--table/)
  })

  test('cards: after a shuffle the hand overlaps in order, About me on top', async ({ page }) => {
    await fresh(page)
    await page.waitForTimeout(2500)
    await switchView(page, 'Cards')
    await page.waitForTimeout(1800)
    await card(page, 'Quick Label').dispatchEvent('click')
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
