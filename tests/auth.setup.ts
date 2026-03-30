import { test as setup, expect } from '@playwright/test';
import { STORAGE_STATE } from '../playwright.config';

const username = process.env.DRUPAL_USER || 'admin';
const password = process.env.DRUPAL_PASS || 'admin';

setup('authenticate as site admin', async ({ page }) => {
  await page.goto('/user/login');
  await page.getByLabel('Username').fill(username);
  await page.getByLabel('Password').fill(password);
  await page.getByRole('button', { name: 'Log in' }).click();

  // Verify login succeeded by checking we're on the user profile page.
  await expect(page).toHaveURL(/\/user\/\d+/);

  await page.context().storageState({ path: STORAGE_STATE });
});
