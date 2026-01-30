import { test, expect } from '@playwright/test'

test.describe('Responsive Design', () => {
  test('should display properly on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/en')
    
    const logo = page.getByAltText('NRB Europe Logo')
    await expect(logo).toBeVisible()
  })

  test('should display properly on tablet', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 })
    await page.goto('/en')
    
    const header = page.locator('header')
    await expect(header).toBeVisible()
  })

  test('should display properly on desktop', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 })
    await page.goto('/en')
    
    const navigation = page.getByRole('navigation')
    await expect(navigation).toBeVisible()
  })

  test('should adapt search bar on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/en')
    
    const searchInput = page.getByPlaceholder(/search/i)
    await expect(searchInput).toBeVisible()
  })

  test('should display language switcher on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/en')
    
    const languageSelect = page.locator('select').first()
    await expect(languageSelect).toBeVisible()
  })
})
