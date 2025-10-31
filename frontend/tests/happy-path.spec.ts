import { expect, test } from '@playwright/test'

test('トリックとストーリーの基本フロー', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { name: '🎃 Halloween Mini Apps' })).toBeVisible()

  await page.getByPlaceholder('名前（任意）').fill('Tester')
  const seedInputs = page.getByPlaceholder(/seed（任意/)
  await seedInputs.first().fill('42')
  await page.getByTestId('trick-button').click()
  await expect(page.getByTestId('trick-result')).toBeVisible()

  await page.getByRole('combobox').first().selectOption('gag')
  await page.getByRole('combobox').nth(1).selectOption('medium')
  await page.getByPlaceholder('主人公名').fill('Tester')
  await page.getByTestId('story-button').click()
  await expect(page.getByTestId('story-result')).toBeVisible()
})
