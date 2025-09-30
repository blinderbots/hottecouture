import { test, expect } from '@playwright/test'

test.describe('Homepage', () => {
  test('should display the homepage correctly', async ({ page }) => {
    await page.goto('/')

    // Check if the main heading is visible
    await expect(page.getByRole('heading', { name: /Welcome to Hotte Couture/i })).toBeVisible()

    // Check if the description is visible
    await expect(page.getByText(/A modern, production-ready web application/i)).toBeVisible()

    // Check if the buttons are visible
    await expect(page.getByRole('button', { name: /Get started/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /Learn more/i })).toBeVisible()

    // Check if the feature cards are visible
    await expect(page.getByText('Next.js 14+')).toBeVisible()
    await expect(page.getByText('TypeScript')).toBeVisible()
    await expect(page.getByText('Tailwind CSS')).toBeVisible()
    await expect(page.getByText('Testing')).toBeVisible()
    await expect(page.getByText('CI/CD')).toBeVisible()
    await expect(page.getByText('Vercel Ready')).toBeVisible()
  })

  test('should be responsive on mobile devices', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/')

    // Check if the main heading is still visible on mobile
    await expect(page.getByRole('heading', { name: /Welcome to Hotte Couture/i })).toBeVisible()

    // Check if the navigation is accessible
    await expect(page.getByRole('link', { name: /Home/i })).toBeVisible()
    await expect(page.getByRole('link', { name: /About/i })).toBeVisible()
    await expect(page.getByRole('link', { name: /Contact/i })).toBeVisible()
  })

  test('should have proper meta tags', async ({ page }) => {
    await page.goto('/')

    // Check title
    await expect(page).toHaveTitle(/Hotte Couture/)

    // Check meta description
    const metaDescription = page.locator('meta[name="description"]')
    await expect(metaDescription).toHaveAttribute('content', /A modern, production-ready web application/)
  })

  test('should have working navigation links', async ({ page }) => {
    await page.goto('/')

    // Test navigation links (they should not cause errors)
    await page.getByRole('link', { name: /About/i }).click()
    // Since we don't have an about page yet, it should show 404
    await expect(page.getByText('Page not found')).toBeVisible()

    // Go back to home
    await page.getByRole('link', { name: /Go back home/i }).click()
    await expect(page.getByRole('heading', { name: /Welcome to Hotte Couture/i })).toBeVisible()
  })
})
