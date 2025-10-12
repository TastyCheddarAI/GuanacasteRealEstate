import { test, expect } from '@playwright/test'

test.describe('Homepage', () => {
  test('loads successfully', async ({ page }) => {
    await page.goto('/')

    // Check that the page loads
    await expect(page).toHaveTitle(/Guanacaste Real/)

    // Check for main content
    await expect(page.locator('h1')).toBeVisible()
  })

  test('navigation works', async ({ page }) => {
    await page.goto('/')

    // Check navigation links exist
    const navLinks = page.locator('nav a')
    await expect(navLinks.first()).toBeVisible()
  })

  test('AI assistant can be opened', async ({ page }) => {
    await page.goto('/')

    // Look for AI assistant trigger (this might be a button or floating action button)
    const aiTrigger = page.locator('[data-testid="ai-assistant-trigger"], .ai-trigger, button').filter({ hasText: /AI|Ask|Assistant/i }).first()

    if (await aiTrigger.isVisible()) {
      await aiTrigger.click()

      // Check if AI assistant modal opens
      const aiModal = page.locator('[role="dialog"], .modal, .ai-assistant').first()
      await expect(aiModal).toBeVisible()
    }
  })

  test('responsive design works', async ({ page, isMobile }) => {
    await page.goto('/')

    if (isMobile) {
      // Check mobile menu exists
      const mobileMenu = page.locator('[data-testid="mobile-menu"], .mobile-menu, button').filter({ hasText: /Menu|☰/i })
      await expect(mobileMenu.or(page.locator('nav')).first()).toBeVisible()
    }
  })
})