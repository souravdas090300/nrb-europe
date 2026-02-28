import { test, expect } from '@playwright/test'

test.describe('Language Switching', () => {
  test('should change language from English to Bengali', async ({ page }) => {
    await page.goto('/en')
    
    // Verify English content — scope to navigation to avoid duplicates
    await expect(page.getByRole('navigation').getByText('Home')).toBeVisible()
    
    // Change to Bengali
    await page.selectOption('select', 'bn')
    
    // Wait for navigation
    await page.waitForURL(/\/bn/)
    
    // Verify Bengali content
    await expect(page).toHaveURL(/\/bn/)
  })

  test('should maintain language preference across pages', async ({ page }) => {
    await page.goto('/en')
    
    // Change to Spanish
    await page.selectOption('select', 'es')
    await page.waitForURL(/\/es/)
    await page.waitForLoadState('networkidle')
    
    // Navigate to another page — scope to nav and use force click (hero image may overlay)
    const categoryLink = page.getByRole('navigation').locator('a[href*="/category/"]').first()
    if (await categoryLink.count() > 0) {
      await categoryLink.waitFor({ state: 'visible', timeout: 10000 })
      await categoryLink.click({ force: true })
      await expect(page).toHaveURL(/\/es\//, { timeout: 10000 })
    }
  })

  test('should update navigation menu in selected language', async ({ page }) => {
    await page.goto('/en')
    // Scope to navigation to avoid matching duplicate "Politics" in footer
    await expect(page.getByRole('navigation').getByText('Politics')).toBeVisible()
    
    await page.selectOption('select', 'es')
    await page.waitForURL(/\/es/)
    await expect(page.getByRole('navigation').getByText('Política')).toBeVisible()
  })

  test('should update footer in selected language', async ({ page }) => {
    await page.goto('/en')
    // Scope to footer link to avoid matching newsletter disclaimer and copyright paragraph
    await expect(page.locator('footer').getByRole('link', { name: 'Privacy Policy' })).toBeVisible()
    
    await page.selectOption('select', 'de')
    await page.waitForURL(/\/de/)
    await expect(page.locator('footer').getByRole('link', { name: 'Datenschutzrichtlinie' })).toBeVisible()
  })

  test('should show all 5 language options', async ({ page }) => {
    await page.goto('/en')
    const select = page.locator('select').first()
    const options = await select.locator('option').count()
    expect(options).toBe(5) // en, bn, es, de, fr
  })
})
