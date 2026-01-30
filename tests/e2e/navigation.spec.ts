import { test, expect } from '@playwright/test'

test.describe('Navigation', () => {
  test('should navigate to category pages', async ({ page }) => {
    await page.goto('/en')
    
    // Find and click a category link
    const politicsLink = page.getByRole('link', { name: /politics/i })
    if (await politicsLink.isVisible()) {
      await politicsLink.click()
      await expect(page).toHaveURL(/category\/politics/)
    }
  })

  test('should navigate to about page', async ({ page }) => {
    await page.goto('/en')
    const aboutLink = page.getByRole('link', { name: /about/i })
    if (await aboutLink.isVisible()) {
      await aboutLink.click()
      await expect(page).toHaveURL(/about/)
    }
  })

  test('should navigate to contact page', async ({ page }) => {
    await page.goto('/en')
    const contactLink = page.getByRole('link', { name: /contact/i })
    if (await contactLink.isVisible()) {
      await contactLink.click()
      await expect(page).toHaveURL(/contact/)
    }
  })

  test('should return to homepage when clicking logo', async ({ page }) => {
    await page.goto('/en/about')
    const logo = page.getByAltText('NRB Europe Logo')
    await logo.click()
    await expect(page).toHaveURL('/en')
  })

  test('should have working footer links', async ({ page }) => {
    await page.goto('/en')
    
    // Scroll to footer
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
    
    const privacyLink = page.getByRole('link', { name: /privacy/i }).last()
    if (await privacyLink.isVisible()) {
      await privacyLink.click()
      await expect(page).toHaveURL(/privacy/)
    }
  })
})
