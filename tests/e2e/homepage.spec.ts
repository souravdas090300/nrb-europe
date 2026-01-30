import { test, expect } from '@playwright/test'

test.describe('Homepage', () => {
  test('should load homepage successfully', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveTitle(/NRB Europe/)
  })

  test('should display header with logo', async ({ page }) => {
    await page.goto('/')
    const logo = page.getByAltText('NRB Europe Logo')
    await expect(logo).toBeVisible()
  })

  test('should display navigation menu', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('navigation')).toBeVisible()
  })

  test('should have language switcher', async ({ page }) => {
    await page.goto('/')
    const languageSelect = page.locator('select').first()
    await expect(languageSelect).toBeVisible()
  })

  test('should have search functionality', async ({ page }) => {
    await page.goto('/')
    const searchInput = page.getByPlaceholder(/search/i)
    await expect(searchInput).toBeVisible()
  })

  test('should display articles on homepage', async ({ page }) => {
    await page.goto('/')
    // Wait for articles to load
    await page.waitForSelector('article, .article-card', { timeout: 5000 })
    const articles = page.locator('article, .article-card')
    await expect(articles.first()).toBeVisible()
  })

  test('should have footer with links', async ({ page }) => {
    await page.goto('/')
    const footer = page.locator('footer')
    await expect(footer).toBeVisible()
    await expect(footer.getByText(/privacy/i)).toBeVisible()
  })
})
