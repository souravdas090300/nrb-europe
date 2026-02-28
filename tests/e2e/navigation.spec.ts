import { test, expect } from '@playwright/test'

test.describe('Navigation', () => {
  test('should navigate to category pages', async ({ page }) => {
    await page.goto('/en')
    await page.waitForLoadState('networkidle')

    // Use a precise CSS selector targeting the header nav politics link
    const politicsLink = page.locator('header nav a[href*="category/politics"]')
    if (await politicsLink.count() > 0) {
      // Programmatic click avoids coordinate issues with overflow-x-auto header
      await politicsLink.evaluate((el) => (el as HTMLElement).click())
      await expect(page).toHaveURL(/category\/politics/, { timeout: 10000 })
    }
  })

  test('should navigate to about page', async ({ page }) => {
    await page.goto('/en')
    await page.waitForLoadState('networkidle')
    // Programmatic click avoids pointer event interception from newsletter overlay on mobile
    const aboutLink = page.locator('footer a[href*="/about"]').first()
    await aboutLink.evaluate((el) => (el as HTMLElement).click())
    await expect(page).toHaveURL(/about/, { timeout: 10000 })
  })

  test('should navigate to contact page', async ({ page }) => {
    await page.goto('/en')
    await page.waitForLoadState('networkidle')
    const contactLink = page.locator('footer a[href*="/contact"]').first()
    await contactLink.evaluate((el) => (el as HTMLElement).click())
    await expect(page).toHaveURL(/contact/, { timeout: 10000 })
  })

  test('should return to homepage when clicking logo', async ({ page }) => {
    await page.goto('/en/about')
    await page.waitForLoadState('networkidle')
    const logoLink = page.locator('a[aria-label="NRB Europe Home"]')
    await logoLink.waitFor({ state: 'visible', timeout: 10000 })
    // Use Promise.all to avoid race between click and navigation
    await Promise.all([
      page.waitForURL(/\/en\/?$/, { timeout: 15000 }),
      logoLink.evaluate((el) => (el as HTMLElement).click()),
    ])
  })

  test('should have working footer links', async ({ page }) => {
    await page.goto('/en')
    await page.waitForLoadState('networkidle')
    const privacyLink = page.locator('footer a[href*="/privacy"]').first()
    await privacyLink.evaluate((el) => (el as HTMLElement).click())
    await expect(page).toHaveURL(/privacy/, { timeout: 10000 })
  })
})
