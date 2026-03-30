import { test, expect } from '@playwright/test';

/**
 * Set up and test functionality of 'Taxonomy' module on GovCMS site.
 *
 * Prerequisites:
 *   - User logged in as Site Admin (Administrator)
 *   - User is on /admin/structure/taxonomy
 */
test.describe('Taxonomy module functionality', () => {
  const vocabName = `Test Vocab ${Date.now()}`;
  const vocabDescription = 'Initial description for test vocabulary';
  const updatedDescription = 'Updated description for test vocabulary';
  const termName = `Test Term ${Date.now()}`;
  const secondVocabName = `Second Vocab ${Date.now()}`;

  test.beforeEach(async ({ page }) => {
    await page.goto('/admin/structure/taxonomy');
  });

  test('create a new vocabulary', async ({ page }) => {
    await page.getByRole('link', { name: 'Add vocabulary' }).click();
    await expect(page).toHaveURL(/\/admin\/structure\/taxonomy\/add/);

    await page.getByLabel('Name').fill(vocabName);
    await page.getByLabel('Description').fill(vocabDescription);
    await page.getByRole('button', { name: 'Save' }).click();

    await expect(page.getByText('Created new vocabulary')).toBeVisible();
  });

  test('edit vocabulary description', async ({ page }) => {
    // Find and click the edit link for our vocabulary.
    const vocabRow = page.locator('tr', { has: page.getByText(vocabName) });
    await vocabRow.getByRole('link', { name: 'Edit vocabulary' }).click();

    await page.getByLabel('Description').fill(updatedDescription);
    await page.getByRole('button', { name: 'Save' }).click();

    await expect(page.getByText('Updated vocabulary')).toBeVisible();
  });

  test('add a term to the vocabulary', async ({ page }) => {
    // Navigate to the vocabulary's term listing and add a term.
    const vocabRow = page.locator('tr', { has: page.getByText(vocabName) });
    await vocabRow.getByRole('link', { name: 'List terms' }).click();
    await page.getByRole('link', { name: 'Add term' }).click();

    await page.getByLabel('Name').fill(termName);
    await page.getByRole('button', { name: 'Save' }).click();

    await expect(page.getByText('Created new term')).toBeVisible();
  });

  test('create additional vocabularies', async ({ page }) => {
    await page.getByRole('link', { name: 'Add vocabulary' }).click();

    await page.getByLabel('Name').fill(secondVocabName);
    await page.getByRole('button', { name: 'Save' }).click();

    await expect(page.getByText('Created new vocabulary')).toBeVisible();
  });

  test('reorder vocabularies', async ({ page }) => {
    // Drupal's taxonomy overview page has a weight-based reorder form.
    // Interact with the weight select to reorder, then save.
    const vocabRow = page.locator('tr', { has: page.getByText(vocabName) });
    const weightSelect = vocabRow.locator('select[name*="weight"]');

    // If the weight select is hidden behind a "Show row weights" link, reveal it.
    const showWeightsLink = page.getByRole('link', { name: 'Show row weights' });
    if (await showWeightsLink.isVisible()) {
      await showWeightsLink.click();
    }

    await weightSelect.selectOption({ index: 0 });
    await page.getByRole('button', { name: 'Save' }).click();

    await expect(
      page.getByText('The configuration options have been saved.')
    ).toBeVisible();
  });

  test('delete a vocabulary', async ({ page }) => {
    // Delete the second vocabulary.
    const vocabRow = page.locator('tr', { has: page.getByText(secondVocabName) });
    await vocabRow.getByRole('link', { name: 'Edit vocabulary' }).click();

    await page.getByRole('link', { name: 'Delete' }).click();

    // Confirm deletion on the confirmation page.
    await page.getByRole('button', { name: 'Delete' }).click();

    await expect(page.getByText('Deleted vocabulary')).toBeVisible();
  });

  test.afterAll(async ({ browser }) => {
    // Clean up: delete the first vocabulary too.
    const context = await browser.newContext({
      storageState: 'playwright/.auth/user.json',
    });
    const page = await context.newPage();

    await page.goto('/admin/structure/taxonomy');
    const vocabRow = page.locator('tr', { has: page.getByText(vocabName) });

    // Only clean up if the vocab still exists.
    if (await vocabRow.isVisible({ timeout: 3000 }).catch(() => false)) {
      await vocabRow.getByRole('link', { name: 'Edit vocabulary' }).click();
      await page.getByRole('link', { name: 'Delete' }).click();
      await page.getByRole('button', { name: 'Delete' }).click();
      await expect(page.getByText('Deleted vocabulary')).toBeVisible();
    }

    await context.close();
  });
});
