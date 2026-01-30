import { test, expect } from '@playwright/test'

test.describe('Language Switching', () => {
  test('should change language from English to Bengali', async ({ page }) => {
    await page.goto('/en')
    
    // Verify English content
    await expect(page.getByText('Home')).toBeVisible()
    
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
    
    // Navigate to another page (if category link exists)
    const categoryLink = page.locator('a[href*="/category/"]').first()
    if (await categoryLink.isVisible()) {
      await categoryLink.click()
      await expect(page).toHaveURL(/\/es\//)
    }
  })

  test('should update navigation menu in selected language', async ({ page }) => {
    await page.goto('/en')
    await expect(page.getByText('Politics')).toBeVisible()
    
    await page.selectOption('select', 'es')
    await page.waitForURL(/\/es/)
    await expect(page.getByText('Política')).toBeVisible()
  })

  test('should update footer in selected language', async ({ page }) => {
    await page.goto('/en')
    await expect(page.getByText('Privacy Policy')).toBeVisible()
    
    await page.selectOption('select', 'de')
    await page.waitForURL(/\/de/)
    await expect(page.getByText('Datenschutzrichtlinie')).toBeVisible()
  })

  test('should show all 5 language options', async ({ page }) => {
    await page.goto('/en')
    const select = page.locator('select').first()
    const options = await select.locator('option').count()
    expect(options).toBe(5) // en, bn, es, de, fr
  })
})
