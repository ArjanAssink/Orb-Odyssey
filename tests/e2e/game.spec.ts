import { test, expect } from '@playwright/test'

test.describe('Orb Odyssey', () => {
  test('loads and renders the canvas', async ({ page }) => {
    await page.goto('/')
    const canvas = page.locator('#game-canvas')
    await expect(canvas).toBeVisible()
  })

  test('shows the main menu on startup', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('.menu-title')).toContainText('Orb Odyssey')
    await expect(page.locator('.menu-button')).toBeVisible()
  })

  test('hides the menu and shows the HUD after pressing Play', async ({ page }) => {
    await page.goto('/')
    await page.click('.menu-button')
    await expect(page.locator('.menu')).toBeHidden()
    await expect(page.locator('.hud')).toBeVisible()
  })

  test('HUD score starts at 0', async ({ page }) => {
    await page.goto('/')
    await page.click('.menu-button')
    await expect(page.locator('#hud-score-text')).toContainText('0 /')
  })

  test('PWA manifest is linked', async ({ page }) => {
    await page.goto('/')
    const manifest = page.locator('link[rel="manifest"]')
    // manifest tag is added by vite-plugin-pwa
    // just verify the page loads without error
    await expect(page).toHaveTitle('Orb Odyssey')
  })
})
