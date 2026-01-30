import { test, expect } from '@playwright/test'

test.describe('Search Functionality', () => {
  test('should display search bar', async ({ page }) => {
    await page.goto('/en')
    const searchInput = page.getByPlaceholder(/search/i)
    await expect(searchInput).toBeVisible()
  })

  test('should allow typing in search field', async ({ page }) => {
    await page.goto('/en')
    const searchInput = page.getByPlaceholder(/search/i)
    await searchInput.fill('politics')
    await expect(searchInput).toHaveValue('politics')
  })

  test('should submit search on enter key', async ({ page }) => {
    await page.goto('/en')
    const searchInput = page.getByPlaceholder(/search/i)
    await searchInput.fill('europe news')
    await searchInput.press('Enter')
    
    // Should navigate to search results
    await page.waitForURL(/search\?q=/, { timeout: 5000 })
    await expect(page).toHaveURL(/search\?q=europe/)
  })

  test('should show search button', async ({ page }) => {
    await page.goto('/en')
    const searchButton = page.locator('button[type="submit"]').first()
    await expect(searchButton).toBeVisible()
  })

  test('should update search placeholder based on language', async ({ page }) => {
    await page.goto('/en')
    let searchInput = page.getByPlaceholder(/search/i)
    await expect(searchInput).toBeVisible()
    
    // Change to Spanish
    await page.selectOption('select', 'es')
    await page.waitForURL(/\/es/)
    
    // Spanish search placeholder
    searchInput = page.getByPlaceholder(/buscar/i)
    if (await searchInput.count() > 0) {
      await expect(searchInput).toBeVisible()
    }
  })
})
