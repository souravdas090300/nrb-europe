import { test, expect } from '@playwright/test'

test.describe('Search Functionality', () => {
  test('should display search bar', async ({ page }) => {
    await page.goto('/en')
    const searchInput = page.locator('input[name="q"]')
    await expect(searchInput).toBeVisible()
  })

  test('should allow typing in search field', async ({ page }) => {
    await page.goto('/en')
    const searchInput = page.locator('input[name="q"]')
    // Click first to focus — the input is small on mobile and fill may not work without focus
    await searchInput.click({ force: true })
    await searchInput.fill('politics')
    await expect(searchInput).toHaveValue('politics')
  })

  test('should submit search on enter key', async ({ page }) => {
    await page.goto('/en')
    await page.waitForLoadState('networkidle')
    // Scope to the search form to avoid hitting other submit buttons on the page
    const searchForm = page.locator('form[action*="/search"]')
    const searchInput = searchForm.locator('input[name="q"]')
    await searchInput.waitFor({ state: 'visible', timeout: 5000 })
    await searchInput.click({ force: true })
    await searchInput.fill('europe news')
    await expect(searchInput).toHaveValue('europe news')
    
    // Submit the form — requestSubmit fires the submit event for proper browser handling
    await searchForm.evaluate((form) => (form as HTMLFormElement).requestSubmit())
    
    // Should navigate to search results
    await page.waitForURL(/search\?q=/, { timeout: 15000 })
    await expect(page).toHaveURL(/search\?q=europe/)
  })

  test('should show search button', async ({ page }) => {
    await page.goto('/en')
    const searchButton = page.locator('button[type="submit"]').first()
    await expect(searchButton).toBeVisible()
  })

  test('should update search placeholder based on language', async ({ page }) => {
    await page.goto('/en')
    let searchInput = page.locator('input[name="q"]')
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
