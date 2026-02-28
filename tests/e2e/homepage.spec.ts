import { test, expect } from '@playwright/test'

test.describe('Homepage', () => {
  test('should load homepage successfully', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveTitle(/NRB Europe/)
  })

  test('should display header with logo', async ({ page }) => {
    await page.goto('/')
    const logoLink = page.locator('a[aria-label="NRB Europe Home"]')
    await expect(logoLink).toBeVisible()
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
    // Wait for articles to load (articles come from Sanity CMS, may need more time)
    await page.waitForSelector('article, .article-card, section h1, section h2', { timeout: 10000 })
    // LatestStories renders <article> tags, HeroSection renders <h1> for main story
    const articles = page.locator('article')
    const heroTitle = page.locator('section h1')
    const hasArticles = await articles.count() > 0
    const hasHero = await heroTitle.count() > 0
    expect(hasArticles || hasHero).toBeTruthy()
  })

  test('should have footer with links', async ({ page }) => {
    await page.goto('/')
    const footer = page.locator('footer')
    await expect(footer).toBeVisible()
    // Use getByRole to avoid matching the copyright paragraph that also mentions 'privacy'
    await expect(footer.getByRole('link', { name: /privacy/i })).toBeVisible()
  })
})
