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

  test('should maintain language preference across pages', async ({ page, isMobile }) => {
    await page.goto('/en')
    
    // Change to Spanish
    await page.selectOption('select', 'es')
    await page.waitForURL(/\/es/)
    await page.waitForLoadState('networkidle')
    
    if (isMobile) {
      // On mobile, open hamburger menu to access category links
      await page.getByLabel('Menu').click()
      const categoryLink = page.locator('a[href*="/category/"]:visible').first()
      await categoryLink.waitFor({ state: 'visible', timeout: 10000 })
      await categoryLink.click({ force: true })
    } else {
      // On desktop, category links are in the nav bar
      const categoryLink = page.getByRole('navigation').locator('a[href*="/category/"]').first()
      if (await categoryLink.count() > 0) {
        await categoryLink.waitFor({ state: 'visible', timeout: 10000 })
        await categoryLink.click({ force: true })
      }
    }
    await expect(page).toHaveURL(/\/es/, { timeout: 10000 })
  })

  test('should update navigation menu in selected language', async ({ page, isMobile }) => {
    await page.goto('/en')
    await page.waitForLoadState('networkidle')

    if (isMobile) {
      // On mobile, categories are inside the hamburger dropdown menu
      const menuBtn = page.getByLabel('Menu')
      await menuBtn.click()
      const dropdown = page.getByTestId('hamburger-menu')
      await dropdown.waitFor({ state: 'visible', timeout: 10000 })
      await expect(dropdown.locator('a[href*="/category/politics"]')).toBeVisible()
      await menuBtn.click() // close menu
      await dropdown.waitFor({ state: 'hidden', timeout: 5000 })

      await page.selectOption('select', 'es')
      await page.waitForURL(/\/es/)
      await page.waitForLoadState('networkidle')

      await menuBtn.click()
      await dropdown.waitFor({ state: 'visible', timeout: 10000 })
      await expect(dropdown.locator('a[href*="/category/politics"]')).toContainText('Política')
    } else {
      // On desktop, categories are visible in the nav bar
      await expect(page.getByRole('navigation').getByText('Politics')).toBeVisible()

      await page.selectOption('select', 'es')
      await page.waitForURL(/\/es/)
      await expect(page.getByRole('navigation').getByText('Política')).toBeVisible()
    }
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
